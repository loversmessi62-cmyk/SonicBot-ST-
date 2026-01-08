// =====================
// ADRI-BOT (Baileys)
// =====================

import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import handler, { loadPlugins } from "./handler.js";
import fs from "fs";

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

async function startBot() {
  console.log("🚀 Iniciando ADRIBOT...");

  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

const sock = makeWASocket({
  logger: pino({ level: "silent" }),
  printQRInTerminal: true,
  auth: state,
  browser: ["ADRIBOT", "Chrome", "6.0"]
});

// 👇 LISTENER DE REACCIONES (bien colocado)
sock.ev.on("messages.reaction", async (reactions) => {
  const r = reactions[0];
  console.log("⚡ EVENTO RAW REACTION:", JSON.stringify(r, null, 2));

  const user = r.participant || r.key.participant;
  if (!user) return;

  const tag = "@" + user.split("@")[0];

  await sock.sendMessage(r.key.remoteJid, {
    text: `👀 Reacción detectada de ${tag}`,
    mentions: [user]
  });
});

// =====================
// EVENTOS EXTERNOS (solo 1 vez)
// =====================
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

          console.log("✅ Aviso post-reinicio enviado");
        } catch (e) {
          console.error("❌ Error enviando aviso post-reinicio:", e);
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


// =====================
// WELCOME / BYE (FINAL)
// =====================
const DEFAULT_WELCOME_IMG = "https://files.catbox.moe/mgqqcn.jpeg";
const DEFAULT_BYE_IMG = "https://files.catbox.moe/tozocs.jpeg";

sock.ev.on("group-participants.update", async update => {
  try {
    const { id, participants, action } = update;
    const metadata = await sock.groupMetadata(id);

    for (const user of participants) {
      if (user === sock.user.id) continue;

      const mention = user.split("@")[0];
      const count = metadata.participants.length;

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
          .replace(
            /@name/g,
            metadata.participants.find(p => p.id === user)?.notify || "Usuario"
          )
          .replace(/@group/g, metadata.subject || "Grupo")
          .replace(/@desc/g, metadata.desc || "Sin descripción")
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
          .replace(
            /@name/g,
            metadata.participants.find(p => p.id === user)?.notify || "Usuario"
          )
          .replace(/@group/g, metadata.subject || "Grupo")
          .replace(/@desc/g, metadata.desc || "Sin descripción")
          .replace(/@count/g, count - 1)
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

startBot();
