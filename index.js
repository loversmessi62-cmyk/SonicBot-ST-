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

// =====================
// NORMALIZAR JID (@lid → real)
// =====================
function normalizeJid(jid) {
  if (!jid) return jid;
  if (jid.endsWith("@lid")) {
    return jid.replace("@lid", "@s.whatsapp.net");
  }
  return jid;
}

// =====================
// START BOT
// =====================
async function startBot() {
  console.log("🚀 Iniciando ADRIBOT...");

  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["ADRIBOT", "Chrome", "6.0"]
  });

  // =====================
  // EVENTOS BASE
  // =====================
  groupAdmins(sock);
  groupSettings(sock);

  sock.ev.on("creds.update", saveCreds);

  // =====================
  // CONEXIÓN
  // =====================
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {

    if (connection === "open") {
      console.log("✅ ADRIBOT CONECTADO");

      setTimeout(async () => {
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

      if (!pluginsLoaded) {
        await loadPlugins();
        pluginsLoaded = true;
        console.log("🔥 Plugins cargados correctamente.");
      }
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log("❌ Sesión cerrada. Borra /sessions/");
        process.exit(1);
      }
    }
  });

  // =====================
  // MENSAJES
  // =====================
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      if (msg.message?.reactionMessage) continue;

      await handler(sock, msg);
    }
  });

// =====================================
// 🔥 WELCOME / BYE PRO (LID SAFE)
// =====================================

sock.ev.on("group-participants.update", async update => {
  try {
    const { id, participants, action } = update;
    if (!["add", "remove"].includes(action)) return;

    const metadata = await sock.groupMetadata(id);
    const members = metadata.participants || [];

    const welcomeImg = fs.readFileSync("./media/welcome.png");
    const byeImg = fs.readFileSync("./media/bye.png");

    const botId = sock.user.id.split(":")[0];

    for (const user of participants) {
      // ⛔ ignorar SOLO si es el bot
      if (user === botId) continue;

      const mention = user.split("@")[0];

      // 🔎 buscar nombre compatible LID
      const member =
        members.find(p => p.id === user) ||
        members.find(p => p.id?.includes(mention));

      const name = member?.notify || member?.name || "Usuario";

      const now = new Date();
      const date = now.toLocaleDateString("es-MX");
      const time = now.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
      });

      let image;
      try {
        image = { url: await sock.profilePictureUrl(user, "image") };
      } catch {
        image = action === "add" ? welcomeImg : byeImg;
      }

      // ========= WELCOME =========
      if (action === "add" && isWelcomeEnabled(id)) {
        const raw = getWelcomeText(id);

        const caption = raw
          .replace(/@user/g, `@${mention}`)
          .replace(/@id/g, mention)
          .replace(/@name/g, name)
          .replace(/@group/g, metadata.subject || "Grupo")
          .replace(/@desc/g, metadata.desc || "Sin descripción")
          .replace(/@count/g, members.length)
          .replace(/@date/g, date)
          .replace(/@time/g, time);

        await sock.sendMessage(id, {
          image,
          caption,
          mentions: [user] // 🔥 LID REAL
        });
      }

      // ========= BYE =========
      if (action === "remove" && isByeEnabled(id)) {
        const raw = getByeText(id);

        const caption = raw
          .replace(/@user/g, `@${mention}`)
          .replace(/@id/g, mention)
          .replace(/@name/g, name)
          .replace(/@group/g, metadata.subject || "Grupo")
          .replace(/@desc/g, metadata.desc || "Sin descripción")
          .replace(/@count/g, members.length - 1)
          .replace(/@date/g, date)
          .replace(/@time/g, time);

        await sock.sendMessage(id, {
          image,
          caption,
          mentions: [user]
        });
      }
    }

  } catch (err) {
    console.error("❌ WELCOME/BYE PRO ERROR:", err);
  }
});

startBot();
