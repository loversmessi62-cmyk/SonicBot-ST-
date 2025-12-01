export default {
    commands: ["todos", "tagall"],
    admin: true,
    category: "admins",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        // En tu base, ES AQUÍ donde viene el grupo
        const metadata = ctx.groupMetadata;

        if (!metadata)
            return sock.sendMessage(jid, { text: "⚠ No pude obtener la información del grupo." });

        const groupName = metadata.subject || "este grupo";

        const participants = metadata.participants || [];

        const mentions = participants.map(p => p.id);

        const mentionText = participants
            .map(p => `@${p.id.split("@")[0]}`)
            .join("\n");

        const texto = `📢 *MENCIÓN MASIVA – ${groupName}*\n\n${mentionText}`;

        await sock.sendMessage(jid, {
            text: texto,
            mentions: mentions
        });
    }
};
