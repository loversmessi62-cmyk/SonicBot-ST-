// =====================
// ADRI-BOT (Baileys GataNina-Li)
// =====================
const processedMessages = new Set();

import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";
import {
    isWelcomeEnabled,
    isByeEnabled,
    getWelcomeText,
    getByeText
} from "./utils/welcomeState.js";

import groupAdmins from "./events/groupAdmins.js";
import groupSettings from "./events/groupSettings.js";
import { handleMessage, loadPlugins } from "./handler.js";
let pluginsLoaded = false;

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = baileys;

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
// REGISTRAR EVENTOS PRO
// =====================
groupAdmins(sock);
groupSettings(sock);

    
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async update => {
        const { connection, lastDisconnect } = update;

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
        console.log("❌ Sesión cerrada. Borra la carpeta /sessions/");
        process.exit(1);
    } else {
        console.log("⚠️ Conexión cerrada, Baileys reconectará solo...");
    }
}

    });

    const cache = new Set();

  const processedMessages = new Set();

sock.ev.on("messages.upsert", async ({ messages, type }) => {
    // ⛔ FILTRO CLAVE (SIN ESTO SIEMPRE HABRÁ DUPLICADOS)
    if (type !== "notify") return;

    for (const msg of messages) {
        try {
            if (!msg.message) continue;
            if (msg.key.fromMe) continue;
            if (msg.message.protocolMessage) continue;
            if (msg.message.senderKeyDistributionMessage) continue;
            if (msg.key.remoteJid === "status@broadcast") continue;

            const id = msg.key.id;
            if (processedMessages.has(id)) continue;

            processedMessages.add(id);
            setTimeout(() => processedMessages.delete(id), 60_000);

            await handleMessage(sock, msg);

        } catch (err) {
            console.error("❌ Error en messages.upsert:", err);
        }
    }
});


    
 // ==================================================
//   👋 WELCOME / BYE PRO (PFP + FALLBACK LINK)
// ==================================================
const DEFAULT_WELCOME_IMG = "https://files.catbox.moe/mgqqcn.jpeg";
const DEFAULT_BYE_IMG = "https://files.catbox.moe/tozocs.jpeg";

sock.ev.on("group-participants.update", async (update) => {
    try {
        const { id, participants, action } = update;

        let metadata;
        try {
            metadata = await sock.groupMetadata(id);
        } catch {
            return;
        }

        for (const user of participants) {
            if (user === sock.user.id) continue;

            const mention = user.split("@")[0];
            const memberCount = metadata.participants.length;

            // ================= FOTO PERFIL O FALLBACK =================
            let imageUrl;
            try {
                imageUrl = await sock.profilePictureUrl(user, "image");
            } catch {
                imageUrl =
                    action === "add"
                        ? DEFAULT_WELCOME_IMG
                        : DEFAULT_BYE_IMG;
            }

            // ================= WELCOME =================
            if (action === "add") {
                if (!isWelcomeEnabled(id)) continue;

                const text = getWelcomeText(id)
                    .replace(/@user/g, `@${mention}`)
                    .replace(/@group/g, metadata.subject)
                    .replace(/@count/g, memberCount);

                await sock.sendMessage(id, {
                    image: { url: imageUrl },
                    caption: text,
                    mentions: [user]
                });
            }

            // ================= BYE =================
            if (action === "remove") {
                if (!isByeEnabled(id)) continue;

                const text = getByeText(id)
                    .replace(/@user/g, `@${mention}`)
                    .replace(/@group/g, metadata.subject)
                    .replace(/@count/g, memberCount - 1);

                await sock.sendMessage(id, {
                    image: { url: imageUrl },
                    caption: text,
                    mentions: [user]
                });
            }
        }
    } catch (err) {
        console.error("❌ Error en welcome/bye:", err);
    }
});


}

startBot();
