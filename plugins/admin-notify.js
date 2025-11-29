export default {
    commands: ["n"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        const texto = args.join(" ") || "Aviso importante";

        await sock.sendMessage(jid, {
            text: `📢 *AVISO DEL ADMIN*\n\n${texto}`
        }, { quoted: msg });
    }
};
