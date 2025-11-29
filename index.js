import makeWASocket, { useMultiFileAuthState, jidDecode } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import qrcode from "qrcode-terminal";
import config from "./config.js";

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./sessions");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["ADRIBOT", "Safari", "1.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // ===========================
    // Cargar plugins
    // ===========================
    const plugins = {};
    const pluginsPath = "./plugins";

    const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith(".js"));
    for (const file of files) {
        const plugin = await import(path.resolve(`${pluginsPath}/${file}`));
        plugins[file] = plugin.default;
        console.log("🔥 Plugin cargado:", file);
    }

    // ===========================
    // Escuchar mensajes
    // ===========================
    sock.ev.on("messages.upsert", async ({ messages }) => {

        const m = messages[0];
        if (!m.message) return;

        const jid = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;
        if (!text) return;

        const prefix = config.prefix;
        if (!text.startsWith(prefix)) return;

        // Separar comando y args
        const [cmd, ...args] = text.slice(prefix.length).trim().split(/\s+/);

        // Info básica
        const isGroup = jid.endsWith("@g.us");
        const sender = m.key.participant || m.key.remoteJid;

        let metadata = {};
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            metadata = await sock.groupMetadata(jid);
            const admins = metadata.participants.filter(p => p.admin);
            isAdmin = admins.some(a => a.id === sender);
            isBotAdmin = admins.some(a => a.id === sock.user.id);
        }

        // Ejecución de plugins
        for (let plugin of Object.values(plugins)) {
            if (!plugin.commands) continue;
            if (plugin.commands.includes(cmd)) {

                try {
                    await plugin.run(sock, m, args, {
                        isGroup,
                        isAdmin,
                        isBotAdmin,
                        metadata
                    });
                } catch (e) {
                    console.log("❌ Error en plugin:", e);
                }
            }
        }
    });
}

startBot();
