export default {
    commands: ["n"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isAdmin)
            return sock.sendMessage(jid, { text: "❌ *Solo los admins pueden usar este comando.*" });

        const texto = args.join(" ") || "Aviso importante";

        await sock.sendMessage(jid, {
            text: `📢 *AVISO DEL ADMIN*\n\n${texto}`
        }, { quoted: msg });
    }
};
