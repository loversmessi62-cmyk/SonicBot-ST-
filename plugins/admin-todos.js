export default {
    commands: ["todos"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        const texto = args.join(" ") || "Mensaje para todos 👇";

        const menciones = ctx.groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(jid, {
            text: `📣 *MENSAJE DEL ADMIN*\n\n${texto}`,
            mentions: menciones
        }, { quoted: msg });
    }
};
