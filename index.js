// =====================
// ADRI-BOT (Baileys GataNina-Li)
// =====================

import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";

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
}

startBot();
