export default {
    commands: ["n"],
    admin: true, // 🔥 Indica al handler que es solo para admins

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isAdmin)
            return sock.sendMessage(jid, { text: "❌ *Solo los admins pueden usar este comando.*" });

        const texto = args.join(" ") || "Aviso importante";

        await sock.sendMessage(
            jid,
            {
                text: `📢 *AVISO DEL ADMIN*\n\n${texto}`
            },
            { quoted: msg }
        );
    }
};
