import config from "../config.js";

export default {
    commands: ["n", "notify"],

    run: async (sock, m, args, { isGroup, isAdmin, metadata }) => {

        if (!isGroup)
            return sock.sendMessage(m.key.remoteJid, { text: config.messages.group }, { quoted: m });

        if (!isAdmin)
            return sock.sendMessage(m.key.remoteJid, { text: config.messages.admin }, { quoted: m });

        let texto = args.join(" ");
        if (!texto) {
            texto = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
            if (!texto)
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Escribe algo o responde un mensaje." });
        }

        const participants = metadata.participants.map(p => p.id);

        await sock.sendMessage(m.key.remoteJid, {
            text: `📢 *AVISO ADMIN:*\n${texto}`,
            mentions: participants
        });
    }
};
