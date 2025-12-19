import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { isMuted } from "./utils/muteState.js";

const groupCache = {};

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
export const handleMessage = async (sock, msg) => {
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
// SISTEMA DE ADMINS FIABLE
// =====================================
if (isGroup) {
  try {
    // Actualizar metadata del grupo siempre
    groupCache[jid] = await sock.groupMetadata(jid);
    metadata = groupCache[jid];

    // Encontrar al sender real
    const found = metadata.participants.find(
      p => p.jid === sender || p.id === sender || p.jid.split("@")[0] === sender.split("@")[0]
    );
    if (found) realSender = found.id;

    // Obtener admins del grupo
    admins = metadata.participants
      .filter(p => p.admin === "admin" || p.admin === "superadmin")
      .map(p => p.id);

    // Verificar si el sender es admin
    const senderNum = realSender.split("@")[0];
    isAdmin = admins.some(a => a === realSender || a.split("@")[0] === senderNum);

    // Verificar si el bot es admin
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    isBotAdmin = admins.some(a => a === botId || a.split("@")[0] === botId.split("@")[0]);

  } catch (err) {
    console.error("❌ Error al obtener admins del grupo:", err);
    admins = [];
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

    // ==================================================
    // SI NO ES COMANDO → onMessage
    // ==================================================
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
    // PROCESAR COMANDO
    // ===============================
    const args = fixedText.slice(1).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    if (!plugins[command]) return;
    const plugin = plugins[command];

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
