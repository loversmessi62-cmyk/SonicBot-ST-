// =====================
// ADRI-BOT (Baileys GataNina-Li)
// =====================

import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";
import config from "./config.js";
import { handler } from "./handler.js";

const { 
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = baileys;

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./sessions");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["ADRIBOT", "Chrome", "6.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // --------------------
    // Cargar Plugins
    // --------------------
    global.plugins = []; // Muy importante

    const pluginsPath = "./plugins";
    const pluginsFiles = fs
        .readdirSync(pluginsPath)
        .filter(f => f.endsWith(".js"));

    for (let file of pluginsFiles) {
        const pluginPath = path.resolve(pluginsPath, file);
        const plugin = await import(pluginPath);

        global.plugins.push(plugin.default);
        console.log(`🔥 Plugin cargado: ${file}`);
    }

    // --------------------
    // Manejo de mensajes → Redirigir al handler
    // --------------------
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        await handler(sock, msg); // <<<<<<<<<<<<<< SOLO ESTO
    });

    // --------------------
    // Reconexión automática
    // --------------------
    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {

        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log("♻️ Reconectando...");
                startBot();
            } else {
                console.log("❌ Sesión cerrada. Borra la carpeta /sessions.");
            }
        }

        if (connection === "open") {
            console.log("✅ ADRIBOT conectado!");
        }
    });

}

startBot();
