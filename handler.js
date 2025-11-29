import config from "./config.js";

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
            msg.message?.sender ||
            msg.message?.senderKeyDistributionMessage?.groupId ||
            null;

        console.log("📌 SENDER:", sender);

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

            console.log("👑 ADMINS DETECTADOS:", admins);

            // Validación exacta
            isAdmin = admins.includes(sender);

            // JID del bot
            const botJid = sock.user.id;
            console.log("🤖 BOT ID:", botJid);

            isBotAdmin = admins.includes(botJid);
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
                groupMetadata: metadata
            });
        }

    } catch (e) {
        console.error("❌ Handler error:", e);
    }
}
