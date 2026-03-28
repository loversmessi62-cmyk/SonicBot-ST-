import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import pino from "pino";
import readline from "readline";
import chokidar from "chokidar";
import qrcode from "qrcode-terminal";

import handler, { loadPlugins } from "./handler.js";
import groupAdmins from "./events/groupAdmins.js";
import groupSettings from "./events/groupSettings.js";

import {
  isWelcomeEnabled,
  isByeEnabled
} from "./utils/welcomeState.js";

console.log("🔥 INDEX INICIADO");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = text =>
  new Promise(resolve => rl.question(text, resolve));

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
let watcherStarted = false;
let reloadTimer = null;
const reloadQueue = new Set();

let pairingMethod = null;
let pairingCodeRequested = false;
let phoneNumber = null;
let botStarted = false;

async function askLinkMethodOnce(state) {
  if (state.creds.registered) return;

  if (!pairingMethod) {
    const answer = await question(
      "\n¿Cómo quieres vincular el bot?\n1) QR\n2) Código de 8 dígitos\nElige 1 o 2: "
    );
    pairingMethod = answer.trim() === "2" ? "code" : "qr";
  }

  if (pairingMethod === "code" && !phoneNumber) {
    let input = "";
    do {
      input = await question(
        "📞 Escribe tu número con código de país, sin + ni espacios. Ejemplo: 50588887777\nNúmero: "
      );
      input = input.trim().replace(/\D/g, "");
    } while (!input);

    phoneNumber = input;
  }
}

async function startBot() {
  if (botStarted) return;
  botStarted = true;

  const { state, saveCreds } = await useMultiFileAuthState("./sessions");
  await askLinkMethodOnce(state);

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["ADRIBOT", "Chrome", "6.0"]
  });

  global.sock = sock;

  groupAdmins(sock);
  groupSettings(sock);

  sock.ev.on("creds.update", saveCreds);

  global.hotReload = async () => {
    try {
      const handlerModule = await import(`./handler.js?update=${Date.now()}`);
      const ok = await handlerModule.loadPlugins();

      if (ok) {
        console.log("♻️ Plugins recargados sin reiniciar");
        return true;
      }

      return false;
    } catch (e) {
      console.error("❌ Error en hotReload:", e);
      return false;
    }
  };

  sock.ev.on("connection.update", async update => {
    const { connection, lastDisconnect, qr } = update;

    try {
      if (qr && pairingMethod === "qr") {
        console.log("📱 Escanea este QR para vincular el bot:\n");
        qrcode.generate(qr, { small: true });
      }

      if (
        pairingMethod === "code" &&
        !state.creds.registered &&
        phoneNumber &&
        !pairingCodeRequested &&
        connection === "connecting"
      ) {
        pairingCodeRequested = true;

        const code = await sock.requestPairingCode(phoneNumber);
        const cleanCode = String(code).replace(/[-\s]/g, "");

        console.log(`🔗 Código de vinculación: ${cleanCode}`);
        console.log("📌 Ingresa ese código en WhatsApp para vincular el dispositivo");
      }

      if (connection === "open") {
        console.log("✅ ADRIBOT CONECTADO");
        pairingCodeRequested = false;

        if (!pluginsLoaded) {
          await loadPlugins();
          pluginsLoaded = true;
          console.log("🔥 Plugins cargados");
        }

        if (!watcherStarted) {
          watcherStarted = true;

          const watcher = chokidar.watch("./plugins", {
            ignoreInitial: true,
            ignored: ["**/node_modules/**", "**/.git/**"],
            awaitWriteFinish: {
              stabilityThreshold: 300,
              pollInterval: 80
            }
          });

          watcher.on("all", async (_, filePath) => {
            try {
              if (!filePath.endsWith(".js")) return;

              reloadQueue.add(filePath);
              clearTimeout(reloadTimer);

              reloadTimer = setTimeout(async () => {
                reloadQueue.clear();
                await global.hotReload();
              }, 300);
            } catch (e) {
              console.error("❌ Error en watcher:", e);
            }
          });

          console.log("👀 Watcher de plugins activado");
        }
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        pairingCodeRequested = false;
        botStarted = false;

        if (code !== DisconnectReason.loggedOut) {
          console.log("⚠️ Conexión cerrada, reconectando...");
          setTimeout(() => startBot(), 3000);
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