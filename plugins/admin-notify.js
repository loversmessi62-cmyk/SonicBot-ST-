import fs from "fs";
import path from "path";

// Normalizar JIDs para que funcione con @lid y @s.whatsapp.net
const normalize = (jid = "") => jid.split("@")[0];

// Cargar plugins automáticamente
const plugins = {};
const pluginsDir = "./plugins";

fs.readdirSync(pluginsDir).forEach(file => {
    if (file.endsWith(".js")) {
        const plugin = await import(path.resolve(`${pluginsDir}/${file}`));
        const cmds = plugin.default.commands;

        cmds.forEach(cmd => {
            plugins[cmd] = plugin.default;
        });
    }
});

export const handleMessage = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        // IDENTIFICAR SENDER
        const senderJID = msg.key.participant || msg.key.remoteJid;
        const sender = normalize(senderJID);

        // IDENTIFICAR BOT
        const botNumber = normalize(sock.user.id);

        let groupMetadata = null;
        let admins = [];
        let isAdmin = false;

        if (isGroup) {
            groupMetadata = await sock.groupMetadata(jid);

            admins = groupMetadata.participants
                .filter(p => p.admin !== null)
                .map(p => normalize(p.id));

            isAdmin = admins.includes(sender);
        }

        // LOGS ÚTILES
        console.log("\n📩 NUEVO MENSAJE");
        console.log("SENDER NORMALIZADO:", sender);
        console.log("BOT NORMALIZADO:", botNumber);
        console.log("ADMINS:", admins);
        console.log("isAdmin:", isAdmin);

        // TEXT
        const text = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text || "";

        if (!text.startsWith(".")) return;

        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!plugins[command]) {
            console.log("❌ Comando no encontrado:", command);
            return;
        }

        const ctx = {
            sender,
            botNumber,
            isGroup,
            isAdmin,
            groupMetadata
        };

        await plugins[command].run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
