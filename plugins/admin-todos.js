export default {
    commands: ["todos", "tagall"],
    admin: true,
    category: "admins",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const metadata = ctx.groupMetadata;

        if (!metadata)
            return sock.sendMessage(jid, { text: "⚠ No pude obtener la información del grupo." });

        const groupName = metadata.subject || "este grupo";
        const participants = metadata.participants || [];

        // Lista PRO de emojis aleatorios
        const emojis = [
            "🔥", "⚡", "💎", "⭐", "🌟", "🚀", "✨",
            "🎯", "🎉", "💥", "💫", "🧨", "⚔️", "👑",
            "🐱", "🐉", "🦊", "🐺", "🦅", "🦂"
        ];

        // IDs para mentions
        const mentions = participants.map(p => p.id);

        // Crear lista pro por tag, con emoji aleatorio
        const mentionText = participants
            .map(p => {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                return `${emoji} @${p.id.split("@")[0]}`;
            })
            .join("\n");

        const texto = `📢 *MENCIÓN MASIVA — ${groupName}*\n\n${mentionText}`;

        await sock.sendMessage(jid, {
            text: texto,
            mentions: mentions
        });
    }
};
