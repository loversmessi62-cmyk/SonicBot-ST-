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

    // Guardar sesión
    sock.ev.on("creds.update", saveCreds);

    // Cargar plugins automáticamente
    const pluginsPath = "./plugins";
    const pluginsFiles = fs.readdirSync(pluginsPath).filter(f => f.endsWith(".js"));

    const plugins = {};
    for (let file of pluginsFiles) {
        const plugin = await import(path.resolve(pluginsPath, file));
        plugins[file] = plugin.default;
        console.log(`🔥 Plugin cargado: ${file}`);
    }

    // Capturar mensajes
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!text) return;

        const prefix = config.prefix;
        if (!text.startsWith(prefix)) return;

        const [command, ...args] = text.slice(prefix.length).trim().split(/\s+/);

        // Buscar plugin que maneje el comando
        for (let plugin of Object.values(plugins)) {
            if (plugin.commands.includes(command)) {
                try {
                    await plugin.run(sock, msg, args, { isGroup });
                } catch (e) {
                    console.log("❌ Error en plugin:", e);
                }
            }
        }
    });
}

startBot();
