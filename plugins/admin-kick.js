export default {
    commands: ["kick", "ban"],
    category: "admin",
    admin: true,
    description: "Expulsa al usuario respondido.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target)
            return sock.sendMessage(jid, { text: "❌ Responde al usuario que quieres expulsar." }, { quoted: msg });

        await sock.groupParticipantsUpdate(jid, [target], "remove");
        await sock.sendMessage(jid, { text: `🦶 Usuario expulsado.` }, { quoted: msg });
    }
};
