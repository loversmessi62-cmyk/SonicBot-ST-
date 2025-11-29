import fs from "fs";
import path from "path";

// Normalizar JIDs
const normalize = (jid = "") => jid.split("@")[0];

// OBJETO DONDE SE GUARDAN LOS COMANDOS
export const plugins = {};

// FUNCIÓN PARA CARGAR PLUGINS
export const loadPlugins = async () => {
    try {
        const dir = "./plugins";
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

        for (let file of files) {
            const module = await import("file://" + path.resolve(`./plugins/${file}`));
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

        const senderJID = msg.key.participant || msg.key.remoteJid;
        const sender = normalize(senderJID);
        const botNumber = normalize(sock.user.id);

        let metadata = null;
        let admins = [];
        let isAdmin = false;

        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            // ==========================
            // 🔥 DEBUG COMPLETO DE ADMINS
            // ==========================
            console.log("\n=======================");
            console.log("📌 INFO DEL GRUPO");
            console.log("=======================");
            console.log("🟦 Grupo:", metadata.subject);
            console.log("👥 Participantes:", metadata.participants.length);

            console.log("\n🟩 PARTICIPANTES RAW:");
            console.log(metadata.participants);

            console.log("\n🟨 ADMINS DETECTADOS (p.admin != null):");
            admins = metadata.participants
                .filter(p => p.admin !== null)
                .map(p => normalize(p.id));

            console.log(admins);

            isAdmin = admins.includes(sender);

            console.log("\n🟥 ¿ERES ADMIN?:", isAdmin);
            console.log("🟦 TU JID NORMALIZADO:", sender);
            console.log("=======================\n");
        }

        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        if (!text.startsWith(".")) return;

        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!plugins[command]) {
            console.log("❌ Comando no encontrado:", command);
            return;
        }

        const plugin = plugins[command];

        // 🔥🔥🔥 FORZAR VALIDACIÓN DE ADMIN 🔥🔥🔥
        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, { text: "❌ *Este comando solo puede usarlo un ADMIN.*" });
        }

        const ctx = {
            sender,
            botNumber,
            isGroup,
            isAdmin,
            groupMetadata: metadata
        };

        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
