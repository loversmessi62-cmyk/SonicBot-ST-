export default {
    commands: ["sticker", "s"],
    category: "multi",
    admin: false,
    description: "Convierte una imagen en sticker.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        if (!msg.message?.imageMessage)
            return sock.sendMessage(jid, { text: "❌ Envía o responde una imagen." }, { quoted: msg });

        const buffer = await sock.downloadMediaMessage(msg);

        await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
    }
};
