// =====================
// ADRI-BOT (Baileys)
// =====================

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

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = baileys;

let pluginsLoaded = false;
let booted = false;

// 📦 CACHÉ GLOBAL DE METADATA
const groupCache = {};


function registerWelcome(sock) {
  const DEFAULT_WELCOME_IMG = "https://files.catbox.moe/mgqqcn.jpeg";
  const DEFAULT_BYE_IMG = "https://files.catbox.moe/tozocs.jpeg";

  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;

      // 🔁 usamos caché primero
      let metadata = groupCache[id] || null;

      const groupName = metadata?.subject || "Grupo";
      const groupDesc = metadata?.desc || "Sin descripción";
      const members = metadata?.participants || [];
      const count = members.length;

      for (const user of participants) {
        if (user === sock.user.id) continue;

        const mention = user.split("@")[0];
        const name =
          members.find(p => p.id === user)?.notify || "Usuario";

        let image;
        try {
          image = await sock.profilePictureUrl(user, "image");
        } catch {
          image = action === "add"
            ? DEFAULT_WELCOME_IMG
            : DEFAULT_BYE_IMG;
        }

        const date = new Date();
        const formattedDate = date.toLocaleDateString("es-MX");
        const formattedTime = date.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit"
        });

        // =====================
        // WELCOME
        // =====================
        if (action === "add" && isWelcomeEnabled(id)) {
          const raw = getWelcomeText(id);

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@id/g, mention)
            .replace(/@name/g, name)
            .replace(/@group/g, groupName)
            .replace(/@desc/g, groupDesc)
            .replace(/@count/g, count)
            .replace(/@date/g, formattedDate)
            .replace(/@time/g, formattedTime);

          await sock.sendMessage(id, {
            image: { url: image },
            caption,
            mentions: [user]
          });
        }

        // =====================
        // BYE
        // =====================
        if (action === "remove" && isByeEnabled(id)) {
          const raw = getByeText(id);

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@id/g, mention)
            .replace(/@name/g, name)
            .replace(/@group/g, groupName)
            .replace(/@desc/g, groupDesc)
            .replace(/@count/g, Math.max(count - 1, 0))
            .replace(/@date/g, formattedDate)
            .replace(/@time/g, formattedTime);

          await sock.sendMessage(id, {
            image: { url: image },
            caption,
            mentions: [user]
          });
        }
      }
    } catch (e) {
      console.error("❌ Error welcome/bye:", e);
    }
  });
}


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

      setTimeout(async () => {

        // 📦 cacheamos metadata UNA VEZ
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
        registerWelcome(sock);

        if (!pluginsLoaded) {
          await loadPlugins();
          pluginsLoaded = true;
          console.log("🔥 Plugins cargados correctamente.");
        }

        if (fs.existsSync("./restart.json")) {
          const data = JSON.parse(fs.readFileSync("./restart.json"));
          fs.unlinkSync("./restart.json");

          await sock.sendMessage(data.jid, {
            text: "✅ *Bot encendido correctamente*"
          });
        }

      }, 3000);
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

