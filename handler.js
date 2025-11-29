import config from "./config.js";
import { jidNormalizedUser } from "@whiskeysockets/baileys";

export async function handler(sock, msg) {
    try {
        const jid = msg.key.remoteJid;
        if (!msg.message) return;

        const isGroup = jid.endsWith("@g.us");

        // DETECTAR SENDER REAL NORMALIZADO
        let rawSender =
            msg.key.participant ||
            msg.participant ||
            msg.key.remoteJid ||
            null;

        const sender = jidNormalizedUser(rawSender);

        console.log("📌 SENDER NORMALIZADO:", sender);

        // DETECTAR TEXTO
        const body =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            "";

        if (!body.startsWith(config.prefix)) return;

        const args = body.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        // ======== METADATA ========
        let metadata = {};
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            // Admins en formato limpio
            const admins = metadata.participants
                .filter(p => p.admin !== null)
                .map(p => jidNormalizedUser(p.id));

            console.log("👑 ADMINS NORMALIZADOS:", admins);

            // SENDER / BOT NORMALIZADOS
            const bot = jidNormalizedUser(sock.user.id);

            console.log("👤 SENDER:", sender);
            console.log("🤖 BOT:", bot);

            // Validaciones reales
            isAdmin = admins.includes(sender);
            isBotAdmin = admins.includes(bot);
        }

        // ======== EJECUTAR PLUGIN ========
        for (let plugin of global.plugins) {
            if (!plugin.commands.includes(command)) continue;

            return plugin.run(sock, msg, args, {
                isGroup,
                isAdmin,
                isBotAdmin,
                metadata
            });
        }

    } catch (e) {
        console.error("❌ Handler error:", e);
    }
}
