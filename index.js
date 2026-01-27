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

import { partidas } from "./plugins/ff-4vs4.js"; // ✅ IMPORT CORRECTO

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
    } catch {
      return groupCache[jid] || null;
    } finally {
      delete groupFetchLocks[jid];
    }
  })();

  return groupFetchLocks[jid];
};

let pluginsLoaded = false;
let restartNotified = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["ADRIBOT", "Chrome", "6.0"]
  });

  groupAdmins(sock);
  groupSettings(sock);

  sock.ev.on("creds.update", saveCreds);

  // ================= CONEXIÓN =================
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      if (!pluginsLoaded) {
        await loadPlugins();
        pluginsLoaded = true;
        console.log("🔥 Plugins cargados");
      }
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) startBot();
    }
  });

  // ================= MENSAJES =================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key?.remoteJid === "status@broadcast") continue;

      msg.message =
        msg.message?.ephemeralMessage?.message ||
        msg.message?.viewOnceMessage?.message ||
        msg.message;

      if (!msg.message) continue;

      await handler(sock, msg);
    }
  });

  // ================= REACCIONES 4VS4 =================
  sock.ev.on("messages.reaction", async reactions => {
    for (const r of reactions) {
      const emoji = r.reaction?.text;
      if (!emoji) continue;

      const jid = r.key.remoteJid;
      const uid = r.key.id + jid;

      const user =
        r.key.participant ||
        r.participant ||
        r.key.remoteJid;

      const partida = partidas[uid];
      if (!partida) continue;

      partida.jugadores.delete(user);
      partida.suplentes.delete(user);

      if (emoji === "❤️" && partida.jugadores.size < 4) {
        partida.jugadores.add(user);
      }

      if (emoji === "👍" && partida.suplentes.size < 2) {
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
❤️ = Jugador
👍 = Suplente
Quita la reacción para salir
`.trim();

      await sock.sendMessage(partida.jid, {
        text: texto,
        edit: r.key.id,
        mentions: [
          ...partida.jugadores,
          ...partida.suplentes
        ]
      });

      console.log("✅ REACCIÓN REGISTRADA", user, emoji);
    }
  });

  // ================= WELCOME / BYE =================
  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;
      if (!["add", "remove"].includes(action)) return;

      const metadata = await getGroupMeta(sock, id);
      if (!metadata) return;

      for (const user of participants) {
        if (action === "add" && isWelcomeEnabled(id)) {
          await sock.sendMessage(id, {
            text: `👋 Bienvenido @${user.split("@")[0]}`,
            mentions: [user]
          });
        }

        if (action === "remove" && isByeEnabled(id)) {
          await sock.sendMessage(id, {
            text: `👋 Adiós @${user.split("@")[0]}`,
            mentions: [user]
          });
        }
      }
    } catch {}
  });
}

startBot();