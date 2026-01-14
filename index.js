// =====================
// ADRI-BOT (Baileys)
// =====================

import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";

import handler, { loadPlugins } from "./handler.js";
import groupAdmins from "./events/groupAdmins.js";
import groupSettings from "./events/groupSettings.js";
import welcomeEvent from "./events/welcome.js";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = baileys;

let pluginsLoaded = false;
let booted = false;

// 📦 caché global de metadata
const groupCache = {};

async function startBot() {
  console.log("🚀 Iniciando ADRIBOT...");

  const { state, saveCreds } =
    await useMultiFileAuthState("./sessions");

    const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["ADRIBOT", "Chrome", "6.0"],
    connectTimeoutMs: 60_000
  });

    sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {

    if (connection === "open" && !booted) {
      booted = true;
      console.log("✅ ADRIBOT CONECTADO");

       // 🔥 REGISTRAR AQUÍ
  welcomeEvent(sock, groupCache);
      
      setTimeout(async () => {

        try {
          const groups = await sock.groupFetchAllParticipating();
          for (const id in groups) {
            groupCache[id] = groups[id];
          }
          console.log("📦 Metadata cacheada:", Object.keys(groupCache).length);
        } catch {
          console.warn("⚠️ No se pudo cachear metadata");
        }

        groupAdmins(sock);
        groupSettings(sock);

        if (!pluginsLoaded) {
          await loadPlugins();
          pluginsLoaded = true;
          console.log("🔥 Plugins cargados correctamente.");
        }

        if (fs.existsSync("./restart.json")) {
          try {
            const data = JSON.parse(fs.readFileSync("./restart.json"));
            fs.unlinkSync("./restart.json");

            await sock.sendMessage(data.jid, {
              text: "✅ *Bot encendido correctamente*\n🚀 Cambios aplicados y funcionando."
            });
          } catch (e) {
            console.error("❌ Error post-reinicio:", e);
          }
        }

      }, 4000);
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log("❌ Sesión cerrada. Borra /sessions/");
        process.exit(1);
      }
    }
  });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      if (msg.message?.reactionMessage) continue;

      await handler(sock, msg);
    }
  });
}

startBot();


