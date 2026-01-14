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

 sock.ev.on("group-participants.update", async update => {
  console.log("🔥 EVENTO group-participants.update:", update);

  try {
    const { id, participants, action } = update;
    if (!["add", "remove"].includes(action)) return;

    const metadata = await sock.groupMetadata(id);
    const count = metadata.participants.length;

    const welcomeImg = fs.readFileSync("./media/welcome.png");
    const byeImg = fs.readFileSync("./media/bye.png");

    const botJid = sock.user.id.replace(/:.*$/, "");

    for (const user of participants) {
      // ❌ ignorar solo si ES el bot
      if (user === botJid) continue;

      const mention = user.split("@")[0];

      const name =
        metadata.participants.find(p =>
          p.id?.includes(mention)
        )?.notify || "Usuario";

      const date = new Date();
      const formattedDate = date.toLocaleDateString("es-MX");
      const formattedTime = date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
      });

      let image;
      try {
        image = { url: await sock.profilePictureUrl(user, "image") };
      } catch {
        image = action === "add" ? welcomeImg : byeImg;
      }

      // ===== WELCOME =====
      if (action === "add" && isWelcomeEnabled(id)) {
        const raw = getWelcomeText(id);

        const caption = raw
          .replace(/@user/g, `@${mention}`)
          .replace(/@id/g, mention)
          .replace(/@name/g, name)
          .replace(/@group/g, metadata.subject || "Grupo")
          .replace(/@desc/g, metadata.desc || "Sin descripción")
          .replace(/@count/g, count)
          .replace(/@date/g, formattedDate)
          .replace(/@time/g, formattedTime);

        await sock.sendMessage(id, {
          image,
          caption,
          mentions: [user] // 🔥 LID REAL
        });
      }

      // ===== BYE =====
      if (action === "remove" && isByeEnabled(id)) {
        const raw = getByeText(id);

        const caption = raw
          .replace(/@user/g, `@${mention}`)
          .replace(/@id/g, mention)
          .replace(/@name/g, name)
          .replace(/@group/g, metadata.subject || "Grupo")
          .replace(/@desc/g, metadata.desc || "Sin descripción")
          .replace(/@count/g, count - 1)
          .replace(/@date/g, formattedDate)
          .replace(/@time/g, formattedTime);

        await sock.sendMessage(id, {
          image,
          caption,
          mentions: [user]
        });
      }
    }

  } catch (e) {
    console.error("❌ Error welcome/bye:", e);
  }
});

startBot();
