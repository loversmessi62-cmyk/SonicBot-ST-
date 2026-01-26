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

function normalizeJid(jid) {
  if (!jid) return jid;
  if (jid.endsWith("@lid")) {
    return jid.replace("@lid", "@s.whatsapp.net");
  }
  return jid;
}

async function startBot() {
  console.log("🚀 Iniciando ADRIBOT...");

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
// 👋 WELCOME / BYE SISTEMA COMPLETO
// =====================================
sock.ev.on("group-participants.update", async update => {
  try {
    console.log("👥 EVENTO GRUPO:", update);

    const { id, participants, action } = update;
    if (!["add", "remove"].includes(action)) return;

    const metadata = await sock.groupMetadata(id);
    const members = metadata.participants || [];

    const welcomeImg = fs.readFileSync("./media/welcome.png");
    const byeImg = fs.readFileSync("./media/bye.png");

    const botId = sock.user.id.split(":")[0];

    for (const user of participants) {
      if (user === botId) continue;

      const mention = user.split("@")[0];
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

      let fileImage;
      try {
        const pfp = await sock.profilePictureUrl(user, "image");
        fileImage = { url: pfp };
      } catch {
        fileImage = action === "add" ? welcomeImg : byeImg;
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

        console.log("✅ WELCOME ENVIADO A:", user);

        await sock.sendMessage(id, {
          image: fileImage,
          caption,
          mentions: [user]
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

        console.log("👋 BYE ENVIADO A:", user);

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