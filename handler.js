import config from "./config.js";

export async function handler(sock, msg) {
    try {
        const jid = msg.key.remoteJid;
        if (!msg.message) return;

        const isGroup = jid.endsWith("@g.us");
        const sender = msg.key.participant || jid;

        // Texto del mensaje
        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";

        if (!body.startsWith(config.prefix)) return;

        const args = body.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        // ============
        // METADATA GROUP
        // ============
        let metadata = {};
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            const admins = metadata.participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => p.id);

            isAdmin = admins.includes(sender);
            isBotAdmin = admins.includes(sock.user.id.split(":")[0] + "@s.whatsapp.net");
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
