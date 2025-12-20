import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { isMuted } from "./utils/muteState.js";

const processedMessages = new Set();
const groupCache = {};

export const store = { chats: {} };

// Cargar store si existe
if (fs.existsSync("./store.json")) {
  Object.assign(store, JSON.parse(fs.readFileSync("./store.json")));
}

// Plugins
export const plugins = {};

export const loadPlugins = async () => {
  try {
    const dir = "./plugins";
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    for (const file of files) {
      try {
        const module = await import("file://" + path.resolve(`./plugins/${file}`));
        const cmds = module.default.commands || module.default.command;
        if (!cmds) continue;
        cmds.forEach(cmd => plugins[cmd] = module.default);
        console.log(`🔥 Plugin cargado: ${file}`);
      } catch (err) {
        console.error(`❌ Error cargando plugin ${file}:`, err);
      }
    }
  } catch (err) {
    console.error("❌ Error cargando plugins:", err);
  }
};

// Handler principal
export const handler = async (sock, msg, { jid, isGroup = false } = {}) => {
  try {
    // ===============================
    // TEXTO NORMALIZADO
    // ===============================
    let text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      msg.message?.templateButtonReplyMessage?.selectedId ||
      "";

    const fixedText = text || `[${Object.keys(msg.message || {})[0]}]`;
    if (!fixedText) return;

    // ===============================
    // LOG DE MENSAJES
    // ===============================
    try {
      const time = new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      const senderNum = (msg.key.participant || msg.key.remoteJid).split("@")[0];
      let groupName = isGroup ? (groupCache[jid]?.subject || "GRUPO") : "PRIVADO";

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

      const preview = fixedText.length > 40 ? fixedText.slice(0, 40) + "..." : fixedText;

      console.log(
        `╔════════════════════════════════════╗\n` +
        `║ 🕒 ${time} ║ 👤 ${senderNum} ║ 👥 ${groupName} ║ 📎 Tipo: ${type} ║ 💬 ${preview}\n` +
        `╚════════════════════════════════════╝`
      );
    } catch (err) {
      console.error("❌ Error log mensajes:", err);
    }

    // ===============================
    // DETECTAR COMANDO
    // ===============================
    const isCommand = fixedText.startsWith(".");
    if (!isCommand) {
      // Plugins onMessage
      const executed = new Set();
      for (const name in plugins) {
        const plug = plugins[name];
        if (executed.has(plug)) continue;
        executed.add(plug);
        if (plug.onMessage) await plug.onMessage(sock, msg);
      }
      return;
    }

    const parts = fixedText.slice(1).trim().split(/\s+/);
    const command = parts.shift()?.toLowerCase();
    const args = parts;

    // ===============================
    // PREVENIR DOBLE EJECUCIÓN
    // ===============================
    const msgId = `${msg.key.remoteJid}_${msg.key.id}_${command}`;
    if (processedMessages.has(msgId)) return;
    processedMessages.add(msgId);
    setTimeout(() => processedMessages.delete(msgId), 60_000);

    const plugin = plugins[command];
    if (!plugin) return;

    // ===============================
    // ESTADO ON/OFF
    // ===============================
    if (getState(command) === false) {
      return sock.sendMessage(jid, { text: `⚠️ El comando *.${command}* está desactivado.` });
    }

    // ===============================
    // ADMINS
    // ===============================
    let metadata, admins = [], isAdmin = false, isBotAdmin = false, realSender;
    if (isGroup) {
      try {
        metadata = await sock.groupMetadata(jid);
        groupCache[jid] = metadata;

        const normalize = j => j?.split(":")[0];
        const senderJid = normalize(msg.key.participant);
        const botJid = normalize(sock.user.id);

        admins = metadata.participants
          .filter(p => p.admin === "admin" || p.admin === "superadmin")
          .map(p => p.id);

        isAdmin = admins.includes(senderJid);
        isBotAdmin = admins.includes(botJid);
        realSender = senderJid;
      } catch {
        admins = []; isAdmin = false; isBotAdmin = false;
      }
    } else {
      realSender = msg.key.remoteJid;
    }

    // ===============================
    // SISTEMA MUTE
    // ===============================
    if (isGroup && isMuted(jid, realSender) && !isAdmin) {
      try {
        await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: msg.key.id, participant: realSender } });
      } catch {}
      return;
    }

    // ===============================
    // ANTI-LINK
    // ===============================
    if (isGroup && /(https?:\/\/|www\.|chat\.whatsapp\.com)/i.test(fixedText)) {
      if (!isAdmin && isBotAdmin) {
        try {
          await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: msg.key.id, participant: realSender } });
          await sock.groupParticipantsUpdate(jid, [realSender], "remove");
        } catch {}
      }
      return;
    }

    // ===============================
    // SOLO ADMINS PARA EL COMANDO
    // ===============================
    if (plugin.admin && !isAdmin) {
      return sock.sendMessage(jid, { text: "❌ Solo administradores pueden usar este comando." });
    }

    // ===============================
    // CONTEXTO Y EJECUCIÓN
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
        const media = m.imageMessage || m.videoMessage || m.stickerMessage || m.documentMessage || m.audioMessage;
        if (!media) throw new Error("NO_MEDIA");

        let buffer = Buffer.from([]);
        for await (const chunk of await downloadContentFromMessage(media, media.mimetype?.split("/")[0] || "file")) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      }
    };

    await plugin.run(sock, msg, args, ctx);

    // ===============================
    // LOG DE COMANDO
    // ===============================
    console.log(`🚀 COMANDO DETECTADO → .${command} | Args: ${args.join(" ") || "NINGUNO"}`);

  } catch (err) {
    console.error("❌ ERROR EN HANDLER:", err);
  }
};
