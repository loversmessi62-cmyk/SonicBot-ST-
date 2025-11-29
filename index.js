import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import qrcode from "qrcode-terminal";
import config from "./config.js";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["ADRIBOT", "Chrome", "6.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // Cargar plugins automáticamente
    const pluginsPath = "./plugins";
    const pluginsFiles = fs.readdirSync(pluginsPath).filter(f => f.endsWith(".js"));
    const plugins = [];

    for (let file of pluginsFiles) {
        const pluginModule = await import(path.resolve(pluginsPath, file));
        const plugin = pluginModule.default;

        if (!plugin || !plugin.commands) {
            console.log(`⚠️ Plugin inválido: ${file}`);
            continue;
        }

        plugins.push(plugin);
        console.log(`🔥 Plugin cargado: ${file}`);
    }

    // Capturar mensajes
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        if (!text.startsWith(config.prefix)) return;

        const [command, ...args] = text
            .slice(config.prefix.length)
            .trim()
            .split(/\s+/);

        for (let plugin of plugins) {
            if (plugin.commands.includes(command)) {
                try {
                    await plugin.run(sock, msg, args, { isGroup });
                } catch (err) {
                    console.log("❌ Error en plugin:", err);
                }
            }
        }
    });
}

startBot();
