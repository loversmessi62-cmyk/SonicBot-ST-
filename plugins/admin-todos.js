export default {
    commands: ["todos"],
    admin: true, // 🔥 Obligatorio para comandos solo-admin

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isAdmin)
            return sock.sendMessage(jid, { text: "❌ *Solo los admins pueden usar este comando.*" });

        const texto = args.join(" ") || "Mensaje para todos 👇";

        const menciones = ctx.groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(
            jid,
            {
                text: `📣 *MENSAJE DEL ADMIN*\n\n${texto}`,
                mentions: menciones
            },
            { quoted: msg }
        );
    }
};
