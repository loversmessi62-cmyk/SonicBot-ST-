import fs from "fs";
import path from "path";

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


// =====================================================
//        ⚡ HANDLER PRINCIPAL (FIX ADMIN LID)
// =====================================================

export const handleMessage = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        // JID ORIGINAL DEL SENDER
        const sender = msg.key.participant || msg.key.remoteJid;

        let metadata = null;
        let admins = [];
        let isAdmin = false;

        // LID REAL DEL SENDER
        let realSender = sender;

        if (isGroup) {

            metadata = await sock.groupMetadata(jid);

            // Buscar el participante para obtener el LID correcto
            const found = metadata.participants.find(p =>
                p.jid === sender || p.id === sender
            );

            if (found) realSender = found.id;

            // LISTA DE ADMINS (LID)
            admins = metadata.participants
                .filter(p => p.admin)
                .map(p => p.id);

            isAdmin = admins.includes(realSender);

            
        }

        // -----------------------
        //   TEXTO & COMANDO
        // -----------------------
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        if (!text.startsWith(".")) return;

        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!plugins[command]) return;

        const plugin = plugins[command];

        // --------------------------------------
        //     PROTECCIÓN SOLO ADMIN (ARREGLADO)
        // --------------------------------------
        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, {
                text: "❌ *Solo los administradores pueden usar este comando.*"
            });
        }
// =====================================================
// 🔥 FUNCIÓN GLOBAL DE DESCARGA
// =====================================================
export const download = async (sock, quotedMsg) => {
    try {
        if (!quotedMsg?.message) return null;

        const buffer = await sock.downloadMediaMessage(quotedMsg);
        return buffer;

    } catch (e) {
        console.error("❌ Error descargando media:", e);
        return null;
    }
};


        const ctx = {
    sender: realSender,
    isAdmin,
    isGroup,
    groupMetadata: metadata,
    plugins
};

        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
