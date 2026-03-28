import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import readline from "readline";

import handler, { loadPlugins } from "./handler.js";
import groupAdmins from "./events/groupAdmins.js";
import groupSettings from "./events/groupSettings.js";

import {
  isWelcomeEnabled,
  isByeEnabled,
  getWelcomeText,
  getByeText
} from "./utils/welcomeState.js";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = baileys;

console.log("🔥 INDEX INICIADO");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = text =>
  new Promise(resolve => rl.question(text, resolve));

let pairingMethod = "qr";
let pairingCodeRequested = false;

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

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

  if (!state.creds.registered) {
    const answer = await question(
      "\n¿Cómo quieres vincular el bot?\n1) QR\n2) Código de 8 dígitos\nElige 1 o 2: "
    );
    pairingMethod = answer.trim() === "2" ? "code" : "qr";
  }

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: pairingMethod === "qr",
    auth: state,
    browser: ["ADRIBOT", "Chrome", "6.0"]
  });

  groupAdmins(sock);
  groupSettings(sock);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    try {
      if (pairingMethod === "qr" && qr) {
        console.log("📱 Escanea el QR para vincular el bot");
      }

      if (
        pairingMethod === "code" &&
        !state.creds.registered &&
        !pairingCodeRequested &&
        (connection === "connecting" || qr)
      ) {
        pairingCodeRequested = true;

        const phoneNumber = await question(
          "📞 Escribe tu número con código de país, sin + ni espacios. Ejemplo: 50588887777\nNúmero: "
        );

        const code = await sock.requestPairingCode(phoneNumber.trim());
        const cleanCode = String(code).replace(/[-\s]/g, "");

        console.log(`🔗 Código de vinculación: ${cleanCode}`);
        console.log("📌 Ingresa ese código en WhatsApp para vincular el dispositivo");
      }

      if (connection === "open") {
        console.log("✅ ADRIBOT CONECTADO");
        pairingCodeRequested = false;
        rl.close();

        if (!pluginsLoaded) {
          await loadPlugins();
          pluginsLoaded = true;
          console.log("🔥 Plugins cargados");
        }
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        pairingCodeRequested = false;

        if (code !== DisconnectReason.loggedOut) {
          console.log("⚠️ Conexión cerrada, reconectando...");
          startBot();
        } else {
          console.log("❌ Sesión cerrada. Debes volver a vincular.");
        }
      }
    } catch (err) {
      console.error("❌ Error en connection.update:", err);
      pairingCodeRequested = false;
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key?.remoteJid === "status@broadcast") continue;

      msg.message =
        msg.message?.ephemeralMessage?.message ||
        msg.message?.viewOnceMessage?.message ||
        msg.message;

      if (!msg.message) continue;

      try {
        await handler(sock, msg);
      } catch (e) {
        console.error("❌ Error en handler:", e);
      }
    }
  });

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
    } catch (err) {
      console.error("❌ Error en group-participants.update:", err);
    }
  });
}

startBot();