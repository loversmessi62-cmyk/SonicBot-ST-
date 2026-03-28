import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { isAntilinkEnabled } from "./utils/antilinkState.js";
import { isModoAdminsEnabled } from "./lib/modoadminsState.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { isMuted } from "./utils/muteState.js";
import { partidas } from "./plugins/ff-4vs4.js";

const groupCache = {};
const groupFetchLocks = {};

const getGroupMeta = async (sock, jid) => {
  if (groupCache[jid]) return groupCache[jid];
  if (groupFetchLocks[jid]) return groupFetchLocks[jid];

  groupFetchLocks[jid] = (async () => {
    try {
      const meta = await sock.groupMetadata(jid);
      groupCache[jid] = meta;
      setTimeout(() => delete groupCache[jid], 5 * 60 * 1000);
      return meta;
    } catch (e) {
      if (e?.data === 429) {
        console.log("🛑 RATE LIMIT — usando cache vieja");
        return groupCache[jid] || null;
      }
      return null;
    } finally {
      delete groupFetchLocks[jid];
    }
  })();

  return groupFetchLocks[jid];
};

console.log("🔥 handler.js cargado");

export const store = {
  chats: {}
};

const saveStore = () => {
  fs.writeFileSync("./store.json", JSON.stringify(store, null, 2));
};

if (fs.existsSync("./store.json")) {
  const old = JSON.parse(fs.readFileSync("./store.json"));
  Object.assign(store, old);
}

export const plugins = {};

export const loadPlugins = async () => {
  try {
    const dir = "./plugins";
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

    for (const key of Object.keys(plugins)) {
      delete plugins[key];
    }

    for (const file of files) {
      try {
        console.log(`🔎 Cargando plugin: ${file}`);

        const module = await import(
          "file://" + path.resolve(`./plugins/${file}`) + `?update=${Date.now()}`
        );

        const plugin = module.default;
        const cmds = plugin?.commands || plugin?.command;

        if (!cmds) {
          console.warn(`⚠️ ${file} no tiene "command" ni "commands"`);
          continue;
        }

        const commandList = Array.isArray(cmds) ? cmds : [cmds];

        for (const cmd of commandList) {
          plugins[cmd] = plugin;
        }

        console.log(`🔥 Plugin cargado: ${file}`);
      } catch (err) {
        console.error(`❌ Error en plugin ${file}:`, err);
      }
    }

    console.log(`✅ Plugins recargados: ${Object.keys(plugins).length}`);
    return true;
  } catch (e) {
    console.error("❌ Error cargando plugins:", e);
    return false;
  }
};

const handler = async (sock, msg) => {
  console.log("📨 MSG TYPE:", Object.keys(msg.message || {})[0]);

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

    const getRealSender = m => (
      m.key?.participant ||
      m.message?.extendedTextMessage?.contextInfo?.participant ||
      m.key?.remoteJid
    );

    const normalizeAll = jid => {
      if (!jid) return null;
      return jid
        .toString()
        .replace(/@s\.whatsapp\.net/g, "")
        .replace(/@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/[^0-9]/g, "");
    };

    if (isGroup) {
      try {
        metadata = await getGroupMeta(sock, jid);

        if (!metadata?.participants) {
          console.log("⚠️ Metadata no disponible, modo seguro activado");
          metadata = { participants: [] };
        }

        const senderJid = getRealSender(msg);
        const senderNum = normalizeAll(senderJid);
        const botNum = normalizeAll(sock.user?.id);

        admins = metadata.participants.filter(
          p => p.admin === "admin" || p.admin === "superadmin"
        );

        const adminIds = admins.flatMap(p => [
          normalizeAll(p.id),
          normalizeAll(p.jid)
        ]).filter(Boolean);

        isAdmin = adminIds.includes(senderNum);

        isBotAdmin = metadata.participants.some(p => {
          const pid = normalizeAll(p.id);
          const pjid = normalizeAll(p.jid);

          return (
            (p.admin === "admin" || p.admin === "superadmin") &&
            (pid === botNum || pjid === botNum)
          );
        });

        console.log("🤖 BOT ADMIN CHECK");
        console.log("Bot:", botNum, "| Admin:", isBotAdmin);
        console.log("User:", senderNum, "| Admin:", isAdmin);
      } catch (err) {
        console.log("⚠️ Metadata no disponible (rate-limit o error), usando modo seguro");
        metadata = null;
        admins = [];
        isAdmin = false;
        isBotAdmin = false;
      }
    }

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

    if (isGroup) {
      if (!store.chats[jid]) store.chats[jid] = {};

      const normalize = v =>
        v?.toString()
          .replace(/@s\.whatsapp\.net|@lid/g, "")
          .replace(/:\d+/g, "")
          .replace(/\D/g, "");

      const senderNum = normalize(realSender);

      if (msg.message) {
        store.chats[jid][senderNum] = {
          time: Date.now(),
          type: Object.keys(msg.message)[0]
        };

        if (metadata?.participants) {
          const p = metadata.participants.find(
            x => normalize(x.jid) === senderNum
          );

          if (p?.id) {
            const lid = normalize(p.id);
            store.chats[jid][lid] = store.chats[jid][senderNum];
          }
        }

        saveStore();
      }
    }

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
      const key = Object.keys(msg.message)[0];
      fixedText = `[${key}]`;
    }

    if (msg.message?.buttonsResponseMessage) {
      const btn = msg.message.buttonsResponseMessage.selectedButtonId;
      if (!btn?.startsWith("4vs4_")) return;

      const ctxBtn = msg.message.buttonsResponseMessage.contextInfo;
      if (!ctxBtn?.stanzaId) return;

      const quoted = ctxBtn.stanzaId;
      const uid = quoted + jid;

      const partida = partidas[uid];
      if (!partida) return;

      const user = realSender;

      partida.jugadores.delete(user);
      partida.suplentes.delete(user);

      if (btn === "4vs4_jugador" && partida.jugadores.size < 4) {
        partida.jugadores.add(user);
      }

      if (btn === "4vs4_suplente" && partida.suplentes.size < 2) {
        partida.suplentes.add(user);
      }

      const format = (arr, max) =>
        Array.from({ length: max }, (_, i) =>
          `${i + 1}. ${arr[i] ? `@${arr[i].split("@")[0]}` : "—"}`
        ).join("\n");

      const texto = `
⚔️ ${partida.titulo} ⚔️

🕒 HORARIOS
🇲🇽 México: ${partida.mx}MX
🇨🇴 Colombia: ${partida.col}COL

━━━━━━━━━━━━━━━

🎮 JUGADORES
${format([...partida.jugadores], 4)}

🪑 SUPLENTES
${format([...partida.suplentes], 2)}

━━━━━━━━━━━━━━━
`.trim();

      await sock.sendMessage(jid, {
        delete: {
          remoteJid: jid,
          fromMe: true,
          id: quoted
        }
      });

      const sent = await sock.sendMessage(jid, {
        text: texto,
        buttons: [
          {
            buttonId: "4vs4_jugador",
            buttonText: { displayText: "🎮 Jugador" },
            type: 1
          },
          {
            buttonId: "4vs4_suplente",
            buttonText: { displayText: "🪑 Suplente" },
            type: 1
          },
          {
            buttonId: "4vs4_quitar",
            buttonText: { displayText: "❌ Quitarme" },
            type: 1
          }
        ],
        headerType: 1,
        mentions: [...partida.jugadores, ...partida.suplentes]
      });

      const newUid = sent.key.id + jid;
      partidas[newUid] = partida;
      delete partidas[uid];

      return;
    }

    try {
      global.messageLog ??= {};
      global.messageLog[jid] ??= {
        numbers: new Set(),
        full: []
      };

      const normalize = v =>
        v?.toString().replace(/@lid|@s\.whatsapp\.net|:\d+|\D/g, "");

      if (msg.message && isGroup) {
        const rawSender = realSender;
        const num = normalize(rawSender);

        global.messageLog[jid].numbers.add(num);

        const record = {
          rawSender,
          jid,
          isLid: rawSender.includes("@lid"),
          num,
          type: Object.keys(msg.message)[0],
          time: new Date().toLocaleTimeString("es-MX")
        };

        global.messageLog[jid].full.push(record);

        console.log("════════════════════════════════════");
        console.log("📩 MENSAJE DETECTADO");
        console.log("👤 RAW:", rawSender);
        console.log("🔢 NUM:", num);
        console.log("📎 TIPO:", record.type);
        console.log("🕒 HORA:", record.time);
        console.log("════════════════════════════════════");
      }
    } catch (e) {
      console.error("❌ Error en messageLog:", e);
    }

    if (fixedText?.startsWith(".")) {
      const tmp = fixedText.slice(1).trim().split(/\s+/);
      const cmd = tmp.shift()?.toLowerCase();
      console.log(`🚀 COMANDO → .${cmd} | Args: ${tmp.join(" ") || "NINGUNO"}`);
    }

    const ctxInfo =
      msg.message?.extendedTextMessage?.contextInfo ||
      msg.message?.imageMessage?.contextInfo ||
      msg.message?.videoMessage?.contextInfo ||
      msg.message?.stickerMessage?.contextInfo ||
      null;

    if (ctxInfo?.quotedMessage) {
      const qMsg = ctxInfo.quotedMessage;
      const qType = Object.keys(qMsg)[0];

      msg.quoted = {
        type: qType,
        message: qMsg,
        mimetype: qMsg[qType]?.mimetype || "",
        text:
          qMsg[qType]?.text ||
          qMsg[qType]?.caption ||
          "",
        isSticker: qType === "stickerMessage"
      };
    } else {
      msg.quoted = null;
    }

    if (isGroup && fixedText && !fixedText.startsWith(".")) {
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

    if (!fixedText || !fixedText.startsWith(".")) {
      const executed = new Set();

      for (const name in plugins) {
        const plug = plugins[name];

        if (executed.has(plug)) continue;
        executed.add(plug);

        if (plug.onMessage) {
          await plug.onMessage(sock, msg);
        }
      }

      return;
    }

    const args = fixedText.slice(1).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    const plugin = plugins[command];

    if (!plugin) return;

    if (isGroup && isModoAdminsEnabled(jid)) {
      const allowAlways = ["modoadmins", "menu", "help"];

      if (!allowAlways.includes(command) && !isAdmin) {
        console.log("🚫 Bloqueado por ModoAdmins:", command);

        await sock.sendMessage(
          jid,
          {
            text: "🔒 *Modo Admins activo*\nSolo administradores pueden usar comandos."
          },
          { quoted: msg }
        );

        return;
      }
    }

    const ctx = {
      sock,
      msg,
      jid,
      sender: realSender,
      isAdmin,
      isBotAdmin,
      isGroup,
      args,
      command,
      groupMetadata: metadata,
      participants: metadata?.participants || [],
      groupAdmins: admins,
      store,
      reloadPlugins: loadPlugins,
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

    const state = getState(command);

    if (state === false && state !== null && state !== undefined) {
      return sock.sendMessage(jid, {
        text: `⚠️ El comando *.${command}* está desactivado.`
      });
    }

    if (plugin.admin && !isAdmin) {
      return sock.sendMessage(jid, {
        text: "❌ Solo administradores pueden usar este comando."
      });
    }

    await plugin.run(sock, msg, args, ctx);
  } catch (e) {
    console.error("❌ ERROR EN HANDLER:", e);
  }
};

export default handler;