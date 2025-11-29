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

    // SESIONES
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["ADRIBOT", "Chrome", "6.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // --------------------
    // LOG de Bot conectado
    // --------------------
    sock.ev.on("connection.update", async update => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("✅ ADRIBOT CONECTADO");

            // 👉 Cargar plugins AQUÍ
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

    // =====================================================
    //        🔥 MANEJO DE MENSAJES (ANTI-DUPLICADO)
    // =====================================================

    const cache = new Set(); // evita duplicados

    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg?.message) return;

            // ❌ ignorar mensajes del propio bot
            if (msg.key.fromMe) return;

            // ❌ ignorar mensajes de sistema
            if (msg.message.protocolMessage) return;
            if (msg.message.senderKeyDistributionMessage) return;

            // ❌ ignorar estados
            if (msg.key.remoteJid === "status@broadcast") return;

            // ❌ evitar procesar dos veces el mismo mensaje
            if (cache.has(msg.key.id)) return;
            cache.add(msg.key.id);

            // ejecutar handler
            await handleMessage(sock, msg);

        } catch (e) {
            console.error("❌ Error en messages.upsert:", e);
        }
    });
}

startBot();
