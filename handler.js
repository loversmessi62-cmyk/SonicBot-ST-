import config from "./config.js";
import { jidNormalizedUser } from "@whiskeysockets/baileys";

export async function handler(sock, msg) {
    try {
        const jid = msg.key.remoteJid;
        if (!msg.message) return;

        const isGroup = jid.endsWith("@g.us");

        // DETECCIÓN REAL DEL SENDER
        const sender =
            msg.key.participant ||
            msg.participant ||
            msg.key.remoteJid ||
            null;

        console.log("📌 SENDER ORIGINAL:", sender);

        // OBTENER TEXTO REAL DEL MENSAJE
        const body =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            "";

        if (!body.startsWith(config.prefix)) return;

        const args = body.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        // ============  
        // METADATA  
        // ============  
        let metadata = {};
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            // Lista de admins REAL
            const admins = metadata.participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => p.id);

            console.log("👑 ADMINS DETECTADOS (RAW):", admins);

            // NORMALIZAR IDS
            const cleanAdmins = admins.map(a => jidNormalizedUser(a));
            const cleanSender = jidNormalizedUser(sender);
            const cleanBot = jidNormalizedUser(sock.user.id);

            console.log("👑 ADMINS LIMPIOS:", cleanAdmins);
            console.log("👤 SENDER LIMPIO:", cleanSender);
            console.log("🤖 BOT LIMPIO:", cleanBot);

            // VERDADERA DETECCIÓN DE ADMIN
            isAdmin = cleanAdmins.includes(cleanSender);

            // DETECCIÓN DE BOT ADMIN
            isBotAdmin = cleanAdmins.includes(cleanBot);
        }

        // ============  
        // EJECUTAR PLUGIN  
        // ============  
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
