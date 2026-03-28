import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
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

let currentSock = null;
let reconnectTimer = null;
let reconnecting = false;
let starting = false;

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

function startWatcher() {
  if (watcherStarted) return;
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
        await global.hotReload?.();
      }, 300);
    } catch (e) {
      console.error("❌ Error en watcher:", e);
    }
  });

  console.log("👀 Watcher de plugins activado");
}

function scheduleReconnect() {
  if (reconnecting || reconnectTimer) return;

  reconnecting = true;
  console.log("⚠️ Conexión cerrada, reconectando en 5 segundos...");

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    reconnecting = false;
    await startBot();
  }, 5000);
}

async function startBot() {
  if (starting) return;
  starting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");
    await askLinkMethodOnce(state);

    if (currentSock) {
      try {
        currentSock.ev.removeAllListeners();
      } catch {}

      try {
        currentSock.ws?.close();
      } catch {}
    }

    const sock = makeWASocket({
      logger: pino({ level: "silent" }),
      auth: state,
      browser: Browsers.macOS("Desktop")
    });

    currentSock = sock;
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
          console.clear();
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

          await new Promise(resolve => setTimeout(resolve, 1500));

          const code = await sock.requestPairingCode(phoneNumber);
          const cleanCode = String(code).replace(/[-\s]/g, "");

          console.log(`🔗 Código de vinculación: ${cleanCode}`);
          console.log("📌 Ingresa ese código en WhatsApp para vincular el dispositivo");
        }

        if (connection === "open") {
          console.log("✅ ADRIBOT CONECTADO");
          pairingCodeRequested = false;

          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
          }

          reconnecting = false;

          if (!pluginsLoaded) {
            await loadPlugins();
            pluginsLoaded = true;
            console.log("🔥 Plugins cargados");
          }

          startWatcher();
        }

        if (connection === "close") {
          const code = lastDisconnect?.error?.output?.statusCode;
          pairingCodeRequested = false;

          if (code === DisconnectReason.loggedOut) {
            console.log("❌ Sesión cerrada. Debes volver a vincular.");
            return;
          }

          scheduleReconnect();
        }
      } catch (err) {
        console.error("❌ Error en connection.update:", err);
        pairingCodeRequested = false;
        scheduleReconnect();
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
  } catch (err) {
    console.error("❌ Error iniciando bot:", err);
    scheduleReconnect();
  } finally {
    starting = false;
  }
}

startBot();