export default {
    commands: ["todos", "tagall"],
    admin: true,
    category: "admins",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        // Obtener metadata correcta sin depender del handler
        const metadata = await sock.groupMetadata(jid);
        const groupName = metadata.subject || "Este grupo";

        // Obtener participantes
        const participants = metadata.participants || [];
        const mentions = participants.map(p => p.id);

        // Texto con menciones uno por uno
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
