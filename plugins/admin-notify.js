export default {
    commands: ["n"],
    admin: true, // Solo admins

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Texto escrito
        let texto = args.join(" ").trim();

        // Si respondió a un mensaje → usar el contenido del mensaje citado
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;

            texto =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                texto;
        }

        if (!texto) {
            return await sock.sendMessage(
                jid,
                { text: "⚠️ Escribe un mensaje o responde alguno." },
                { quoted: msg }
            );
        }

        // Enviar mensaje tal cual
        await sock.sendMessage(
            jid,
            { text: texto },
            { quoted: msg }
        );
    }
};
