export default {
    commands: ["todos", "tagall"],
    admin: true,
    category: "admins",

    async run(sock, msg, args, ctx) {
        const { isGroup, metadata } = ctx;
        const jid = msg.key.remoteJid;

        if (!isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const groupName = metadata.subject || "Este grupo";

        // Obtener todos los participantes
        const participants = metadata.participants || [];

        // Formar lista de menciones
        const mentions = participants.map(p => p.id);

        // Crear texto con menciones línea por línea
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
