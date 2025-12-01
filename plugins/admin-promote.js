export default {
    commands: ["promote", "admin"],
    category: "admin",
    admin: true,
    description: "Da admin al usuario respondido.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target)
            return sock.sendMessage(jid, { text: "❌ Responde a alguien para promoverlo." }, { quoted: msg });

        await sock.groupParticipantsUpdate(jid, [target], "promote");
        await sock.sendMessage(jid, { text: `👑 Ahora es administrador.` }, { quoted: msg });
    }
};
