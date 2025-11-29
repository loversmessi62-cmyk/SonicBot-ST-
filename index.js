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

    // --------------------
    // Autenticación
    // --------------------
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
    const pluginsPath = "./plugins";
    const pluginsFiles = fs
        .readdirSync(pluginsPath)
        .filter(f => f.endsWith(".js"));

    const plugins = {};

    for (let file of pluginsFiles) {
        const pluginPath = path.resolve(pluginsPath, file);
        const plugin = await import(pluginPath);

        plugins[file] = plugin.default;
        console.log(`🔥 Plugin cargado: ${file}`);
    }

    // --------------------
    // Manejo de mensajes
    // --------------------
    sock.ev.on("messages.upsert", async ({ messages }) => {

        let msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        // Texto (mensaje normal o extendido)
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text;

        if (!text) return;

        const prefix = config.prefix;
        if (!text.startsWith(prefix)) return;

        const [command, ...args] = text
            .slice(prefix.length)
            .trim()
            .split(/\s+/);

        // --------------------
        // Obtener metadata, admins y permisos
        // --------------------
        let groupMetadata = null;
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            groupMetadata = await sock.groupMetadata(from);

            const adminList = groupMetadata.participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => p.id);

            isAdmin = adminList.includes(sender);
            isBotAdmin = adminList.includes(sock.user.id);
        }

        // --------------------
        // Ejecutar plugin
        // --------------------
        for (let plugin of Object.values(plugins)) {
            if (!plugin.commands) continue;

            if (plugin.commands.includes(command)) {
                try {
                    await plugin.run(sock, msg, args, {
                        isGroup,
                        isAdmin,
                        isBotAdmin,
                        groupMetadata,
                        prefix
                    });
                } catch (e) {
                    console.log("❌ Error en plugin:", e);
                }
            }
        }

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
