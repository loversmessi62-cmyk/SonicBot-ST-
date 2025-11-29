import config from "../config.js";

export default {
    commands: ["n", "notify"],

    run: async (sock, m, args, { isGroup, isAdmin, metadata }) => {

        if (!isGroup)
            return sock.sendMessage(m.key.remoteJid, { text: config.messages.group }, { quoted: m });

        if (!isAdmin)
            return sock.sendMessage(m.key.remoteJid, { text: config.messages.admin }, { quoted: m });

        let text = args.join(" ");

        if (!text) {
            text = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
            if (!text)
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Escribe algo.\nEjemplo: `.n hola`" });
        }

        const mentions = metadata.participants.map(p => p.id);

        await sock.sendMessage(m.key.remoteJid, {
            text: `📢 *AVISO ADMIN:*\n${text}`,
            mentions
        });
    }
};
