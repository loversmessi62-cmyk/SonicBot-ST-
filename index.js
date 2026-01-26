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
    } catch (e) {
      if (e?.data === 429) {
        console.log("🛑 RATE LIMIT (WELCOME) — usando cache");
        return groupCache[jid] || null;
      }
      return null;
    } finally {
      delete groupFetchLocks[jid];
    }
  })();

  return groupFetchLocks[jid];
};
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

  groupAdmins(sock);
  groupSettings(sock);

  sock.ev.on("creds.update", saveCreds);

  // ================= CONEXIÓN =================
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ ADRIBOT CONECTADO");

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

  // ================= MENSAJES (ARREGLADO) =================
  sock.ev.on("messages.upsert", async ({ messages }) => {
  for (const msg of messages) {

    if (!msg.message) continue;
    if (msg.key?.remoteJid === "status@broadcast") continue;

    const type = Object.keys(msg.message)[0];

    // 🚫 IGNORAR BASURA DE WHATSAPP
    if (type === "protocolMessage") continue;
    if (type === "senderKeyDistributionMessage") continue;
    if (type === "messageContextInfo") continue;

    console.log("📩 MENSAJE REAL:", type);

    try {
      await handler(sock, msg);
    } catch (e) {
      console.error("❌ Error en handler:", e);
    }
  }
});

  // ================= WELCOME / BYE =================
  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;
      if (!["add", "remove"].includes(action)) return;

const metadata = await getGroupMeta(sock, id);
if (!metadata) return; // 🛡️ evita crash

const members = metadata.participants || [];

      const welcomeImg = fs.readFileSync("./media/welcome.png");
      const byeImg = fs.readFileSync("./media/bye.png");

      const botId = sock.user.id.split(":")[0];

      for (const user of participants) {
        if (user === botId) continue;

        const mention = user.split("@")[0];
        const member = members.find(p => p.id === user);
        const name = member?.notify || member?.name || "Usuario";

        const now = new Date();
        const date = now.toLocaleDateString("es-MX");
        const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

        let fileImage;
        try {
          const pfp = await sock.profilePictureUrl(user, "image");
          fileImage = { url: pfp };
        } catch {
          fileImage = action === "add" ? welcomeImg : byeImg;
        }

        if (action === "add" && isWelcomeEnabled(id)) {
          const caption = getWelcomeText(id)
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, metadata.subject || "Grupo")
            .replace(/@count/g, members.length)
            .replace(/@date/g, date)
            .replace(/@time/g, time);

          await sock.sendMessage(id, { image: fileImage, caption, mentions: [user] });
        }

        if (action === "remove" && isByeEnabled(id)) {
          const caption = getByeText(id)
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, metadata.subject || "Grupo")
            .replace(/@count/g, members.length - 1)
            .replace(/@date/g, date)
            .replace(/@time/g, time);

          await sock.sendMessage(id, { image: fileImage, caption, mentions: [user] });
        }
      }
    } catch (err) {
      console.error("❌ ERROR WELCOME/BYE:", err);
    }
  });

}

startBot();
