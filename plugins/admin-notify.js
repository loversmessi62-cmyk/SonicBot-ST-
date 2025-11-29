import config from "../config.js";

export default {
    commands: ["n", "notify"],

    run: async (sock, msg, args, { isGroup }) => {

        if (!isGroup)
            return sock.sendMessage(msg.key.remoteJid, { text: config.messages.group });

        const jid = msg.key.remoteJid;

        let texto = args.join(" ");

        // Si no envía texto, intentar usar el mensaje citado
        if (!texto) {
            const quotedText =
                msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

            if (!quotedText)
                return sock.sendMessage(jid, { text: "📌 Usa: .n mensaje o responde .n a un mensaje." });

            texto = quotedText;
        }

        const metadata = await sock.groupMetadata(jid);
        const mentions = metadata.participants.map(p => p.id);

        await sock.sendMessage(jid, {
            text: `📢 *AVISO ADMIN:*\n${texto}`,
            mentions
        });
    }
};
