import config from "../config.js";

export default {
    commands: ["n", "notify"],

    run: async (sock, msg, args, { isGroup, isAdmin, groupMetadata }) => {

        const jid = msg.key.remoteJid;

        if (!isGroup)
            return sock.sendMessage(jid, { text: config.messages.group });

        if (!isAdmin)
            return sock.sendMessage(jid, { text: config.messages.admin });

        // Texto del comando
        let texto = args.join(" ");

        // Si NO escribió texto → revisar mensaje citado
        if (!texto) {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            texto =
                quoted?.conversation ||
                quoted?.extendedTextMessage?.text ||
                quoted?.imageMessage?.caption ||
                null;
        }

        if (!texto)
            return sock.sendMessage(jid, {
                text: "📌 Debes escribir algo o responder un mensaje.\n\nEjemplo:\n.n Hola grupo"
            });

        // Mencionar a todos
        const menciones = groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(jid, {
            text: `📢 *AVISO ADMIN:*\n${texto}`,
            mentions: menciones
        });

    }
};
