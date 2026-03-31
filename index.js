import fs from "fs";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import pino from "pino";
import readline from "readline";
import chokidar from "chokidar";
import qrcode from "qrcode-terminal";

import groupAdmins from "./events/groupAdmins.js";
import groupSettings from "./events/groupSettings.js";

import {
  isWelcomeEnabled,
  isByeEnabled
} from "./utils/welcomeState.js";

console.log("🔥 INDEX INICIADO");

const SESSIONS_DIR = "./sessions";

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

let currentHandler = null;
let currentLoadPlugins = null;

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
let clearingSession = false;

function normalizePhoneNumber(input) {
  let number = String(input || "").trim().replace(/\D/g, "");

  if (number.startsWith("52") && !number.startsWith("521")) {
    number = "521" + number.slice(2);
  }

  return number;
}

function resetPairingState() {
  pairingMethod = null;
  pairingCodeRequested = false;
  phoneNumber = null;
}

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function clearSessions() {
  try {
    if (fs.existsSync(SESSIONS_DIR)) {
      fs.rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
  } catch {}
  ensureSessionsDir();
}

async function loadHandlerModule() {
  const handlerModule = await import(`./handler.js?update=${Date.now()}`);
  currentHandler = handlerModule.default;
  currentLoadPlugins = handlerModule.loadPlugins;
}

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
        "📞 Escribe tu número con código de país, sin + ni espacios. Ejemplo: 5215512345678\nNúmero: "
      );
      input = normalizePhoneNumber(input);
    } while (!input);

    phoneNumber = input;
    console.log(`✅ Número detectado: ${phoneNumber}`);
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

function scheduleReconnect(ms = 8000) {
  if (reconnecting || reconnectTimer || clearingSession) return;

  reconnecting = true;
  console.log(`⚠️ Conexión cerrada, reconectando en ${Math.floor(ms / 1000)} segundos...`);

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    reconnecting = false;
    await startBot();
  }, ms);
}

async function handleLoggedOut() {
  if (clearingSession) return;
  clearingSession = true;

  try {
    console.log("❌ Sesión cerrada (401). Limpiando sesión y reiniciando vínculo...");
    resetPairingState();

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    reconnecting = false;

    if (currentSock) {
      try {
        currentSock.ev.removeAllListeners();
      } catch {}

      try {
        currentSock.end?.();
      } catch {}

      try {
        currentSock.ws?.close();
      } catch {}
    }

    clearSessions();

    setTimeout(async () => {
      clearingSession = false;
      await startBot();
    }, 3000);
  } catch (e) {
    clearingSession = false;
    console.error("❌ Error limpiando sesión:", e);
  }
}

async function startBot() {
  if (starting || clearingSession) return;
  starting = true;

  try {
    ensureSessionsDir();

    const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
    await askLinkMethodOnce(state);
    await loadHandlerModule();

    const { version } = await fetchLatestBaileysVersion();

    if (currentSock) {
      try {
        currentSock.ev.removeAllListeners();
      } catch {}

      try {
        currentSock.end?.();
      } catch {}

      try {
        currentSock.ws?.close();
      } catch {}
    }

    const sock = makeWASocket({
      logger: pino({ level: "silent" }),
      auth: state,
      browser: Browsers.macOS("Desktop"),
      version,
      connectTimeoutMs: 60000,
      qrTimeout: 60000,
      markOnlineOnConnect: false,
      syncFullHistory: false
    });

    sock.reply = async (jid, text, quoted, options = {}) => {
      return sock.sendMessage(
        jid,
        { text, ...options },
        { quoted }
      );
    };

    sock.getName = async jid => {
      try {
        const contact = sock.contacts?.[jid] || {};
        return (
          contact.name ||
          contact.notify ||
          contact.verifiedName ||
          jid.split("@")[0]
        );
      } catch {
        return jid.split("@")[0];
      }
    };

    currentSock = sock;
    global.sock = sock;

    groupAdmins(sock);
    groupSettings(sock);

    sock.ev.on("creds.update", saveCreds);

    global.hotReload = async () => {
      try {
        await loadHandlerModule();

        if (typeof currentLoadPlugins === "function") {
          const ok = await currentLoadPlugins();

          if (ok) {
            console.log("♻️ Handler y plugins recargados sin reiniciar");
            return true;
          }
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
          (connection === "connecting" || !!qr)
        ) {
          pairingCodeRequested = true;

          await new Promise(resolve => setTimeout(resolve, 2000));

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
            await currentLoadPlugins();
            pluginsLoaded = true;
            console.log("🔥 Plugins cargados");
          }

          startWatcher();
        }

        if (connection === "close") {
          const code = lastDisconnect?.error?.output?.statusCode;
          console.log("❌ Conexión cerrada. Código:", code);

          pairingCodeRequested = false;

          if (code === DisconnectReason.loggedOut || code === 401) {
            await handleLoggedOut();
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
          if (typeof currentHandler === "function") {
            await currentHandler(sock, msg);
          }
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