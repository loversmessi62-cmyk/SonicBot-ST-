import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";

import handler, { loadPlugins } from "./handler.js";
import groupAdmins from "./events/groupAdmins.js";
import groupSettings from "./events/groupSettings.js";

import {
  isWelcomeEnabled,
  isByeEnabled,
  getWelcomeText,
  getByeText
} from "./utils/welcomeState.js";

import fourVsFour from "./plugins/4vs4.js"; // 👈 IMPORTAMOS EL PLUGIN

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = baileys;

console.log("🔥 INDEX INICIADO");

// ================= CACHE ANTI-RATE LIMIT =================
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
        console.log("🛑 RATE LIMIT — usando cache");
        return groupCache[jid] || null;
      }
      return null;
    } finally {
      delete groupFetchLocks[jid];
    }
  })();

  return groupFetchLocks[jid];
};

// ================= BOT =================
let pluginsLoaded = false;

// 🔔 EVITA DOBLE AVISO POST-UPDATE
let restartNotified = false;

async function startBot() {
  console.log("🚀 CREANDO SOCKET NUEVO");

  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["ADRIBOT", "Chrome", "6.0"]
  });

  console.log("🎧 REGISTRANDO EVENTOS DEL SOCKET");

  groupAdmins(sock);
  groupSettings(sock);

  sock.ev.on("creds.update", saveCreds);

  // ================= CONEXIÓN =================
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {

    if (connection === "open") {
      console.log("✅ ADRIBOT CONECTADO");

      // 🔔 AVISO POST-UPDATE (UNA SOLA VEZ)
      const restartFile = "./restart.json";
      if (!restartNotified && fs.existsSync(restartFile)) {
        restartNotified = true;
        try {
          const data = JSON.parse(fs.readFileSync(restartFile));
          const segundos = Math.floor((Date.now() - data.at) / 1000);

          await sock.sendMessage(data.jid, {
            text:
              "🤖 *ADRIBOT EN LÍNEA*\n\n" +
              "✅ Actualización aplicada correctamente\n" +
              `👤 Owner: ${data.by}\n` +
              `⏱️ Tiempo fuera: ${segundos}s`
          });

          fs.unlinkSync(restartFile);
        } catch (e) {
          console.error("❌ Error leyendo restart.json:", e);
        }
      }

      if (!pluginsLoaded) {
        await loadPlugins();
        pluginsLoaded = true;
        console.log("🔥 Plugins cargados.");
      }
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log("🔴 CONEXIÓN CERRADA:", code);

      if (code === DisconnectReason.loggedOut) {
        console.log("❌ Sesión cerrada.");
        process.exit(1);
      }

      console.log("🔁 REINICIANDO SOCKET...");
      startBot();
    }
  });

  // ================= MENSAJES =================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    console.log("📩 EVENTO messages.upsert RECIBIDO");

    for (let msg of messages) {
      if (msg.key?.remoteJid === "status@broadcast") continue;

      msg.message =
        msg.message?.ephemeralMessage?.message ||
        msg.message?.viewOnceMessage?.message ||
        msg.message;

      if (!msg.message) continue;

      const type = Object.keys(msg.message)[0];
      console.log("💬 TIPO:", type);

      // ================= REACCIONES 4VS4 =================
      if (msg.message.reactionMessage) {
        const r = msg.message.reactionMessage;
        const msgId = r.key.id;
        const emoji = r.text;

        const user =
          r.key.participant ||
          msg.key.participant ||
          r.key.remoteJid;

        const partida = fourVsFour.partidas?.[msgId];
        if (!partida) return;

        partida.jugadores.delete(user);
        partida.suplentes.delete(user);

        if (emoji === "❤️" && partida.jugadores.size < 4) {
          partida.jugadores.add(user);
        }

        if (emoji === "👍" && partida.suplentes.size < 2) {
          partida.suplentes.add(user);
        }

        const j = [...partida.jugadores];
        const s = [...partida.suplentes];

        const format = (arr, max) =>
          Array.from({ length: max }, (_, i) =>
            `${i + 1}. ${arr[i] ? `@${arr[i].split("@")[0]}` : "—"}`
          ).join("\n");

        const nuevoTexto = `
⚔️ ${partida.titulo} ⚔️

🕒 HORARIOS
🇲🇽 México: ${partida.mx}MX
🇨🇴 Colombia: ${partida.col}COL

━━━━━━━━━━━━━━━

🎮 JUGADORES
${format(j, 4)}

🪑 SUPLENTES
${format(s, 2)}

━━━━━━━━━━━━━━━
❤️ = Jugador
👍 = Suplente
Quita la reacción para salir
`.trim();

        await sock.sendMessage(partida.jid, {
          text: nuevoTexto,
          edit: msgId,
          mentions: [...j, ...s]
        });

        return;
      }

      try {
        await handler(sock, msg);
      } catch (e) {
        console.error("❌ Error en handler:", e);
      }
    }
  });

  // ================= WELCOME / BYE =================
  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;
      if (!["add", "remove"].includes(action)) return;

      const metadata = await getGroupMeta(sock, id);
      if (!metadata) return;

      const members = metadata.participants || [];
      const botId = sock.user.id.split(":")[0];

      for (const user of participants) {
        if (user === botId) continue;

        const mention = user.split("@")[0];
        const member = members.find(p => p.id === user);

        const now = new Date();
        const date = now.toLocaleDateString("es-MX");
        const time = now.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit"
        });

        let fileImage;
        try {
          const pfp = await sock.profilePictureUrl(user, "image");
          fileImage = { url: pfp };
        } catch {
          fileImage = fs.readFileSync(
            action === "add"
              ? "./media/welcome.png"
              : "./media/bye.png"
          );
        }

        if (action === "add" && isWelcomeEnabled(id)) {
          const caption = getWelcomeText(id)
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, metadata.subject || "Grupo")
            .replace(/@count/g, members.length)
            .replace(/@date/g, date)
            .replace(/@time/g, time);

          await sock.sendMessage(id, {
            image: fileImage,
            caption,
            mentions: [user]
          });
        }

        if (action === "remove" && isByeEnabled(id)) {
          const caption = getByeText(id)
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, metadata.subject || "Grupo")
            .replace(/@count/g, members.length - 1)
            .replace(/@date/g, date)
            .replace(/@time/g, time);

          await sock.sendMessage(id, {
            image: fileImage,
            caption,
            mentions: [user]
          });
        }
      }
    } catch (err) {
      console.error("❌ ERROR WELCOME/BYE:", err);
    }
  });
}

startBot();