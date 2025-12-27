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
  chats: {}, // jid → { user → count }
};

// Guardar store en disco (opcional)
const saveStore = () => {
  fs.writeFileSync("./store.json", JSON.stringify(store, null, 2));
};

// Cargar store si existe
if (fs.existsSync("./store.json")) {
  const old = JSON.parse(fs.readFileSync("./store.json"));
  Object.assign(store, old);
}

// ============================================
// SISTEMA DE PLUGINS
// ============================================
export const plugins = {};

export const loadPlugins = async () => {
  try {
    const dir = "./plugins";
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

    for (let file of files) {
      try {
        console.log(`🔎 Cargando plugin: ${file}`);
        const module = await import("file://" + path.resolve(`./plugins/${file}`));
        const cmds = module.default.commands || module.default.command;
        if (!cmds) {
          console.warn(`⚠️ ${file} no tiene "command" ni "commands"`);
          continue;
        }
        cmds.forEach(cmd => plugins[cmd] = module.default);
        console.log(`🔥 Plugin cargado: ${file}`);
      } catch (err) {
        console.error(`❌ Error en plugin ${file}:`, err);
      }
    }
  } catch (e) {
    console.error("❌ Error cargando plugins:", e);
  }
};

// =====================================================
// ⚡ HANDLER PRINCIPAL ⚡
// =====================================================
const handler = async (sock, msg) => {
  try {
    const jid = msg.key.remoteJid;
    const isGroup = jid.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    let realSender = sender;
    let metadata = null;
    let admins = [];
    let isAdmin = false;
    let isBotAdmin = false;


          // =====================================
// SISTEMA ADMIN MATCH TOTAL (ULTRA) [FIX]
// =====================================
if (isGroup) {
  try {
    metadata = await sock.groupMetadata(jid);
    groupCache[jid] = metadata;

    // ─── recolectar TODAS las identidades posibles del sender ───
    const senderIds = new Set();

    const pushSender = v => {
      if (v && typeof v === "string") senderIds.add(v);
    };

    pushSender(msg.key.participant);
    pushSender(msg.key.remoteJid);
    pushSender(msg.message?.extendedTextMessage?.contextInfo?.participant);

    // normalizaciones sender
    [...senderIds].forEach(id => {
      const num = id.replace(/[^0-9]/g, "");
      if (num) {
        senderIds.add(num);
        senderIds.add(num + "@s.whatsapp.net");
        senderIds.add(num + "@c.us");
        senderIds.add(num + "@lid");
      }
    });

    // ─── recolectar TODAS las identidades de los admins ───
    const adminIds = new Set();

    metadata.participants
      .filter(p => p.admin === "admin" || p.admin === "superadmin")
      .forEach(p => {
        adminIds.add(p.id);

        const num = p.id.replace(/[^0-9]/g, "");
        if (num) {
          adminIds.add(num);
          adminIds.add(num + "@s.whatsapp.net");
          adminIds.add(num + "@c.us");
          adminIds.add(num + "@lid");
        }
      });

    // ─── detección FINAL usuario ───
    isAdmin = [...senderIds].some(id => adminIds.has(id));

    // ─── BOT admin (FIX) ───
    const botIds = new Set();

    botIds.add(sock.user.id);
    const botNum = sock.user.id.replace(/[^0-9]/g, "");
    if (botNum) {
      botIds.add(botNum);
      botIds.add(botNum + "@s.whatsapp.net");
      botIds.add(botNum + "@c.us");
      botIds.add(botNum + "@lid");
    }

    isBotAdmin = [...botIds].some(id => adminIds.has(id));

    // 🔍 DEBUG
    console.log("===== ADMIN MATCH TOTAL (FIX) =====");
    console.log("Sender IDs:", [...senderIds]);
    console.log("Admin IDs:", [...adminIds]);
    console.log("Es Admin?", isAdmin);
    console.log("Es Bot Admin?", isBotAdmin);
    console.log("==================================");

  } catch (e) {
    console.error("❌ Error admin ultra:", e);
    isAdmin = false;
    isBotAdmin = false;
  }
}
    // ===============================
    // 🔇 SISTEMA MUTE REAL (CORRECTO)
    // ===============================
    if (isGroup && isMuted(jid, realSender)) {
      if (!isAdmin) {
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

    // 🔥 TEXTO FORZADO (para logs y comandos)
    let fixedText = text;
    if (!fixedText && msg.message) {
      const key = Object.keys(msg.message)[0];
      fixedText = `[${key}]`;
    }

    // =====================================
    // 📟 LOG DE MENSAJES
    // =====================================
    try {
      const time = new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      const senderNum = realSender.split("@")[0];
      let groupName = "PRIVADO";
      if (isGroup && metadata) groupName = metadata.subject;

      const m = msg.message || {};
      let type = "DESCONOCIDO";
      if (m.conversation || m.extendedTextMessage) type = "TEXTO";
      else if (m.imageMessage) type = "IMAGEN";
      else if (m.videoMessage) type = "VIDEO";
      else if (m.stickerMessage) type = "STICKER";
      else if (m.audioMessage) type = "AUDIO";
      else if (m.documentMessage) type = "DOCUMENTO";
      else if (m.reactionMessage) type = "REACCIÓN";
      else if (m.viewOnceMessage || m.viewOnceMessageV2) type = "VIEWONCE";

      const preview =
        fixedText && fixedText.length > 40
          ? fixedText.slice(0, 40) + "..."
          : fixedText || "[SIN TEXTO]";

      console.log(
        `╔════════════════════════════════════╗
║ 🕒 ${time} ║ 👤 ${senderNum} ║ 👥 ${groupName} ║ 📎 Tipo: ${type} ║ 💬 ${preview}
╚════════════════════════════════════╝`
      );
    } catch (e) {
      console.error("❌ Error en log:", e);
    }

    // =====================================
    // 🚀 LOG GARANTIZADO DE COMANDOS
    // =====================================
    if (fixedText?.startsWith(".")) {
      const tmp = fixedText.slice(1).trim().split(/\s+/);
      const cmd = tmp.shift()?.toLowerCase();
      console.log(
        `🚀 COMANDO DETECTADO → .${cmd} | Args: ${tmp.join(" ") || "NINGUNO"}`
      );
    }

    // =========================================================
    // SISTEMA ANTILINK
    // =========================================================
    if (isGroup && fixedText) {
      const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;
      if (linkRegex.test(fixedText)) {
        // 🔒 Verificar estado
        if (!isAntilinkEnabled(jid)) return;
        // ❌ Ignorar admins
        if (isAdmin) return;

        // 🗑️ Borrar mensaje
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

        // 🦶 Expulsar si se puede
        if (isBotAdmin) {
          try {
            await sock.groupParticipantsUpdate(jid, [realSender], "remove");
          } catch {}
        }
        return;
      }
    }

    // ===============================
// SI NO ES COMANDO → onMessage (FIX)
// ===============================
if (!fixedText || !fixedText.startsWith(".")) {

  const executed = new Set();

  for (let name in plugins) {
    const plug = plugins[name];

    // ⚠️ evita ejecutar el mismo plugin más de una vez
    if (executed.has(plug)) continue;
    executed.add(plug);

    if (plug.onMessage) {
      await plug.onMessage(sock, msg);
    }
  }

  return;
}

// ===============================
// PROCESAR COMANDO
// ===============================
const args = fixedText.slice(1).trim().split(/\s+/);
const command = args.shift()?.toLowerCase();
const plugin = plugins[command];

if (!plugin) return;

// =====================================
// 🔐 MODO ADMINS - BLOQUEO DEFINITIVO
// =====================================
if (isGroup && isModoAdminsEnabled(jid)) {

  const allowAlways = ["modoadmins", "menu", "help"];

  if (!allowAlways.includes(command)) {

    if (!isAdmin) {
      console.log("🚫 Bloqueado por ModoAdmins:", command);

      return sock.sendMessage(
        jid,
        {
          text: "🔒 *Modo Admins activo*\nSolo administradores pueden usar comandos."
        },
        { quoted: msg }
      );
    }
  }
}
    

    // ===============================
    // CONTEXTO (ctx)
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
        if (!m) throw new Error("NO_MEDIA");

        const media =
          m.imageMessage ||
          m.videoMessage ||
          m.stickerMessage ||
          m.documentMessage ||
          m.audioMessage;
        if (!media) throw new Error("NO_MEDIA");

        const stream = await downloadContentFromMessage(
          media,
          media.mimetype?.split("/")[0] || "file"
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      }
    };

    // ===============================
    // SISTEMA ON / OFF
    // ===============================
    const state = getState(command);
    if (state === false) {
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
    // EJECUTAR COMANDO
    // ===============================
    await plugin.run(sock, msg, args, ctx);

  } catch (e) {
    console.error("❌ ERROR EN HANDLER:", e);
  }

};

  export default handler;
