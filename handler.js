import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { isAntilinkEnabled } from "./utils/antilinkState.js";
import { isModoAdminsEnabled } from "./lib/modoadminsState.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { isMuted } from "./utils/muteState.js";

const groupCache = {};
console.log("🔥 handler.js cargado");

// =========================================================
// 📌 STORE GLOBAL
// =========================================================
export const store = {
  chats: {},
};

if (fs.existsSync("./store.json")) {
  Object.assign(store, JSON.parse(fs.readFileSync("./store.json")));
}

// =========================================================
// ⚡ HANDLER PRINCIPAL ⚡
// =========================================================
const handler = async (sock, msg) => {
  try {
    const jid = msg.key.remoteJid;
    const isGroup = jid?.endsWith("@g.us");

    let realSender =
      msg.key.participant ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      jid;

    let metadata = null;
    let admins = [];
    let isAdmin = false;
    let isBotAdmin = false;

    // =====================================
    // 🔐 ADMIN MATCH REAL (FIX DEFINITIVO)
    // =====================================
    if (isGroup) {
      try {
        metadata = await sock.groupMetadata(jid);
        groupCache[jid] = metadata;

        const normalize = j =>
          j?.toString().replace(/[^0-9]/g, "") || null;

        const senderNum = normalize(realSender);
        const botNum = normalize(sock.user?.id);

        admins = metadata.participants
          .filter(p => p.admin === "admin" || p.admin === "superadmin")
          .map(p => p.id);

        const adminNums = new Set(
          admins.map(a => normalize(a)).filter(Boolean)
        );

        isAdmin = adminNums.has(senderNum);
        isBotAdmin = adminNums.has(botNum);
      } catch (e) {
        console.error("❌ Error admin:", e);
      }
    }

    // ===============================
    // 🔇 SISTEMA MUTE
    // ===============================
    if (isGroup && isMuted(jid, realSender) && !isAdmin) {
      try {
        await sock.sendMessage(jid, {
          delete: {
            remoteJid: jid,
            fromMe: false,
            id: msg.key.id,
            participant: realSender
          }
        });
      } catch {}
      return;
    }

    // ===============================
    // TEXTO NORMALIZADO
    // ===============================
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      msg.message?.templateButtonReplyMessage?.selectedId ||
      "";

    let fixedText = text;
    if (!fixedText && msg.message) {
      fixedText = `[${Object.keys(msg.message)[0]}]`;
    }

    // ===============================
    // 📟 LOG
    // ===============================
    try {
      console.log("🧪 CHECK ADMIN FINAL");
      console.log("Sender:", realSender);
      console.log("Admins:", admins);
      console.log("isAdmin:", isAdmin);
    } catch {}

    // ===============================
    // ANTILINK
    // ===============================
    if (isGroup && fixedText) {
      const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;
      if (linkRegex.test(fixedText)) {
        if (!isAntilinkEnabled(jid)) return;
        if (isAdmin) return;

        try {
          await sock.sendMessage(jid, {
            delete: {
              remoteJid: jid,
              fromMe: false,
              id: msg.key.id,
              participant: realSender
            }
          });
        } catch {}

        if (isBotAdmin) {
          try {
            await sock.groupParticipantsUpdate(jid, [realSender], "remove");
          } catch {}
        }
        return;
      }
    }

    // ===============================
    // MENSAJES NORMALES
    // ===============================
    if (!fixedText || !fixedText.startsWith(".")) {
      for (let name in plugins) {
        const plug = plugins[name];
        if (plug.onMessage) {
          await plug.onMessage(sock, msg);
        }
      }
      return;
    }

    // ===============================
    // COMANDOS
    // ===============================
    const args = fixedText.slice(1).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    const plugin = plugins[command];
    if (!plugin) return;

    // ===============================
    // 🔐 MODO ADMINS
    // ===============================
    if (isGroup && isModoAdminsEnabled(jid)) {
      const allow = ["menu", "help", "modoadmins"];
      if (!allow.includes(command) && !isAdmin) {
        return sock.sendMessage(jid, {
          text: "🔒 *Modo Admins activo*\nSolo administradores."
        });
      }
    }

    // ===============================
    // CONTEXTO
    // ===============================
    const ctx = {
      sock,
      msg,
      jid,
      sender: realSender,
      isAdmin,
      isBotAdmin,
      isGroup,
      args,
      groupMetadata: metadata,
      participants: metadata?.participants || [],
      groupAdmins: admins,
      store,
      download: async () => {
        const m = msg.message;
        const media =
          m.imageMessage ||
          m.videoMessage ||
          m.audioMessage ||
          m.documentMessage ||
          m.stickerMessage;
        if (!media) throw "NO_MEDIA";

        const stream = await downloadContentFromMessage(
          media,
          media.mimetype.split("/")[0]
        );
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      }
    };

    // ===============================
    // ON / OFF
    // ===============================
    if (getState(command) === false) {
      return sock.sendMessage(jid, {
        text: `⚠️ El comando *.${command}* está desactivado.`
      });
    }

    // ===============================
    // SOLO ADMINS
    // ===============================
    if (plugin.admin && !isAdmin) {
      return sock.sendMessage(jid, {
        text: "❌ Solo administradores pueden usar este comando."
      });
    }

    // ===============================
    // EJECUTAR
    // ===============================
    await plugin.run(sock, msg, args, ctx);

  } catch (e) {
    console.error("❌ ERROR EN HANDLER:", e);
  }
};

export default handler;
