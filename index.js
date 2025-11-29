// =====================
// ADRI-BOT (Baileys GataNina-Li)
// =====================

import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { handleMessage } from "./handler.js";

// __dirname FIX (ES MODULES)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // ----------------------------------
    // CONEXIÓN
    // ----------------------------------
    sock.ev.on("connection.update", update => {
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
                console.log("❌ Sesión cerrada. Borra la carpeta /sessions/");
            }
        }
    });

    // ----------------------------------
    // CARGA DE PLUGINS
    // ----------------------------------
    global.plugins = [];
    const pluginsDir = path.join(__dirname, "plugins");

    console.log("📦 Cargando plugins...");

    const files = fs.readdirSync(pluginsDir);

    for (const file of files) {
        if (file.endsWith(".js")) {
            const pluginPath = path.resolve(pluginsDir, file);

            try {
                const plugin = await import(`file://${pluginPath}`);
                global.plugins.push(plugin.default);

                console.log(`🔥 Plugin cargado: ${file}`);
            } catch (err) {
                console.log(`❌ Error cargando plugin ${file}:`, err);
            }
        }
    }

    // ----------------------------------
    // MANEJO DE MENSAJES
    // ----------------------------------
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        await handleMessage(sock, msg);
    });
}

startBot();
