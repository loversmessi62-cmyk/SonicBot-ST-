export default {
    commands: ["demote"],
    category: "administracion",
    admin: true,
    description: "Quita admin al usuario respondido.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target)
            return sock.sendMessage(jid, { text: "❌ Responde a alguien para degradarlo." }, { quoted: msg });

        await sock.groupParticipantsUpdate(jid, [target], "demote");
        await sock.sendMessage(jid, { text: `⬇️ Se le quitó el admin.` }, { quoted: msg });
    }
};
