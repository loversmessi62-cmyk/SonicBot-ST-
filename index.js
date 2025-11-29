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

    // =====================
    // SESIONES
    // =====================
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["ADRIBOT", "Chrome", "6.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // =====================
    // ESTADO DE CONEXIÓN
    // =====================
    sock.ev.on("connection.update", async update => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("✅ ADRIBOT CONECTADO");
        }

        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;

            if (code !== DisconnectReason.loggedOut) {
                console.log("♻️ Reconectando...");
                startBot();
            } else {
                console.log("❌ Sesión cerrada. Borra /sessions/");
            }
        }
    });

    // =====================
    // CARGA DE PLUGINS
    // =====================
    console.log("📦 Cargando plugins...");
    await loadPlugins();   // ← MUY IMPORTANTE
    console.log("✅ Plugins cargados correctamente");

    // =====================
    // RECEPCIÓN DE MENSAJES
    // =====================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        await handleMessage(sock, msg);
    });
}

startBot();
