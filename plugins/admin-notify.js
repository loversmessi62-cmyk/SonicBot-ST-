import config from "../config.js";

export default {
    commands: ["n", "notify"],

    run: async (sock, msg, args, { isGroup, isAdmin, isBotAdmin, groupMetadata }) => {

        const jid = msg.key.remoteJid;

        // Solo grupos
        if (!isGroup)
            return sock.sendMessage(jid, { text: config.messages.group });

        // Solo admins
        if (!isAdmin)
            return sock.sendMessage(jid, { text: config.messages.admin });

        // Opcional: si quieres que SOLO funcione si el bot es admin
        // (si no, puedes borrar esto)
        if (!isBotAdmin)
            return sock.sendMessage(jid, {
                text: "❗ Necesito permisos de *administrador* para mencionar a todos."
            });

        // ---------------------------
        // Obtener texto del comando
        // ---------------------------

        let texto = args.join(" ").trim();

        // Si no escribió texto, buscar en el mensaje citado
        if (!texto) {
            const quoted = msg.message?.extendedTextMessage?.contextInfo;

            if (quoted) {
                const q = quoted.quotedMessage;
                texto =
                    q?.conversation ||
                    q?.extendedTextMessage?.text ||
                    q?.imageMessage?.caption ||
                    q?.videoMessage?.caption ||
                    null;
            }
        }

        if (!texto)
            return sock.sendMessage(jid, {
                text: "📌 Debes escribir un aviso o responder un mensaje.\n\nEjemplo:\n.n Hola grupo"
            });

        // ---------------------------
        // Mencionar a todos
        // ---------------------------

        const menciones = groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(jid, {
            text: `📢 *AVISO DEL ADMIN:*\n${texto}`,
            mentions: menciones
        });
    }
};
