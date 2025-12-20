// =====================
// ADRI-BOT (Baileys GataNina-Li)
// =====================

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
import groupParticipants from "./events/groupParticipants.js";
import { handleMessage, loadPlugins } from "./handler.js";

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
groupParticipants(sock);

    
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async update => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("✅ ADRIBOT CONECTADO");

            await loadPlugins();
            console.log("🔥 Plugins cargados correctamente.");
        }

        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;

            if (code !== DisconnectReason.loggedOut) {
                console.log("♻️ Reconectando...");
                startBot();
            } else {
                console.log("❌ Sesión cerrada. Borra la carpeta /sessions/");
            }
        }
    });

    const cache = new Set();

    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg?.message) return;
            

            if (msg.key.fromMe) return;
            if (msg.message.protocolMessage) return;
            if (msg.message.senderKeyDistributionMessage) return;
            if (msg.key.remoteJid === "status@broadcast") return;

            if (cache.has(msg.key.id)) return;
            cache.add(msg.key.id);

            const texto =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                "";

            console.log(`[MSJ] ${msg.key.remoteJid} -> ${texto}`);

            await handleMessage(sock, msg);

        } catch (e) {
            console.error("❌ Error en messages.upsert:", e);
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
