// =====================
// ADRI-BOT (Baileys GataNina-Li)
// =====================

import baileys from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";
import config from "./config.js";

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

    // Guardar sesión
    sock.ev.on("creds.update", saveCreds);

    // ====================
    // Cargar plugins
    // ====================
    const pluginsPath = "./plugins";
    const pluginsFiles = fs.readdirSync(pluginsPath).filter(p => p.endsWith(".js"));

    const plugins = {};

    for (let file of pluginsFiles) {
        const fullPath = path.resolve(pluginsPath, file);
        const plugin = await import(fullPath);
        plugins[file] = plugin.default;

        console.log(`🔥 Plugin cargado: ${file}`);
    }

    // ====================
    // Manejo de mensajes
    // ====================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        let msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const prefix = config.prefix;
        if (!text.startsWith(prefix)) return;

        const [command, ...args] = text
            .slice(prefix.length)
            .trim()
            .split(/\s+/);

        // Ejecutar plugin
        for (let plugin of Object.values(plugins)) {
            if (!plugin.commands) continue;

            if (plugin.commands.includes(command)) {
                try {
                    await plugin.run(sock, msg, args, {
                        isGroup,
                        prefix
                    });
                } catch (e) {
                    console.log("❌ Error en plugin:", e);
                }
            }
        }
    });

    // ====================
    // Reconexión automática
    // ====================
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
