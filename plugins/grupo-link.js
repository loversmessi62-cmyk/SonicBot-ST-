export default {
    commands: ["link"],
    category: "grupo",
    admin: false,
    description: "Muestra el enlace del grupo.",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        try {
            const code = await sock.groupInviteCode(jid);
            await sock.sendMessage(jid, {
                text: `🔗 *Invitación del grupo:*\nhttps://chat.whatsapp.com/${code}`
            }, { quoted: msg });

        } catch {
            await sock.sendMessage(jid, { text: "❌ No tengo permiso para ver el link." }, { quoted: msg });
        }
    }
};
