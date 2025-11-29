import fs from "fs";
import path from "path";

// Normalizar JIDs
const normalize = (jid = "") => jid.split("@")[0];

// OBJETO DONDE SE GUARDAN LOS COMANDOS
export const plugins = {};

// FUNCIÓN PARA CARGAR PLUGINS (NO EN TOP-LEVEL)
export const loadPlugins = async () => {
    try {
        const dir = "./plugins";
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

        for (let file of files) {
            const pluginPath = "file://" + path.resolve(`./plugins/${file}`);
            const module = await import(pluginPath);

            const cmds = module.default.commands;

            cmds.forEach(cmd => {
                plugins[cmd] = module.default;
            });

            console.log(`🔥 Plugin cargado: ${file}`);
        }

    } catch (e) {
        console.error("❌ Error cargando plugins:", e);
    }
};


// ==================================================
//                  HANDLER
// ==================================================
export const handleMessage = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        // DETECTAR SENDER
        const senderJID = msg.key.participant || msg.key.remoteJid;
        const sender = normalize(senderJID);

        // DETECTAR BOT
        const botNumber = normalize(sock.user.id);

        let metadata = null;
        let admins = [];
        let isAdmin = false;

        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            admins = metadata.participants
                .filter(p => p.admin !== null)
                .map(p => normalize(p.id));

            isAdmin = admins.includes(sender);
        }

        // TEXTO
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        if (!text.startsWith(".")) return;

        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        // ¿Existe comando?
        if (!plugins[command]) {
            console.log("❌ Comando no encontrado:", command);
            return;
        }

        // CONTEXTO PARA PLUGINS
        const ctx = {
            sender,
            botNumber,
            isGroup,
            isAdmin,
            groupMetadata: metadata
        };

        await plugins[command].run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
