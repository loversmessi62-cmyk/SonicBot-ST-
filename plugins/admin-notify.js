import config from "../config.js";

export default {
    commands: ["n", "notify"],

    run: async (sock, msg, args, ctx) => {
        const { isGroup, isAdmin, groupMetadata } = ctx;
        const jid = msg.key.remoteJid;

        if (!isGroup)
            return sock.sendMessage(jid, { text: config.messages.group });

        if (!isAdmin)
            return sock.sendMessage(jid, { text: config.messages.admin });

        let texto = args.join(" ");

        if (!texto) {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            texto =
                quoted?.conversation ||
                quoted?.extendedTextMessage?.text ||
                quoted?.imageMessage?.caption ||
                null;
        }

        if (!texto)
            return sock.sendMessage(jid, {
                text: "📌 *Debes escribir algo o responder un mensaje.*\nEjemplo:\n.n Hola grupo"
            });

        const menciones = groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(jid, {
            text: `📢 *AVISO DEL ADMIN*\n\n${texto}`,
            mentions: menciones
        });
    }
};
