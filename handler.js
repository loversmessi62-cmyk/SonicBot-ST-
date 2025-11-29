import fs from "fs";
import path from "path";

// ===============================
//      NORMALIZAR JID
// ===============================
const normalize = (jid = "") => jid.split("@")[0].replace(/\D/g, "");

// =================================
//      SISTEMA DE PLUGINS
// =================================

export const plugins = {};

export const loadPlugins = async () => {
    try {
        const dir = "./plugins";
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

        for (let file of files) {
            const module = await import("file://" + path.resolve(`./plugins/${file}`));
            const cmds = module.default.commands;

            cmds.forEach(cmd => plugins[cmd] = module.default);

            console.log(`🔥 Plugin cargado: ${file}`);
        }
    } catch (e) {
        console.error("❌ Error cargando plugins:", e);
    }
};

// =================================
//        HANDLER PRINCIPAL
// =================================

export const handleMessage = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        const senderJID = msg.key.participant || msg.key.remoteJid;
        const sender = normalize(senderJID);

        let metadata = null;
        let admins = [];
        let isAdmin = false;

        // ===============================
        //        OBTENER ADMINS
        // ===============================
        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            admins = metadata.participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => normalize(p.id));

            isAdmin = admins.includes(sender);

            console.log(`
=======================
📌 INFO DEL GRUPO
=======================
👥 Participantes: ${metadata.participants.length}

🟦 PARTICIPANTES RAW:
${JSON.stringify(metadata.participants, null, 2)}

🟩 ADMINS DETECTADOS:
${JSON.stringify(admins, null, 2)}

🟥 ERES ADMIN: ${isAdmin}
🟦 TU ID: ${sender}
=======================
`);
        }

        // ===============================
        //     EXTRAER TEXTO / COMMAND
        // ===============================
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        if (!text.startsWith(".")) return;

        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!plugins[command]) {
            console.log("❌ Comando no existe:", command);
            return;
        }

        const plugin = plugins[command];

        // ===============================
        //      PROTECCIÓN DE ADMIN
        // ===============================
        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, { text: "❌ *Solo los admins pueden usar este comando.*" });
        }

        const ctx = {
            sender,
            isGroup,
            isAdmin,
            groupMetadata: metadata
        };

        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
