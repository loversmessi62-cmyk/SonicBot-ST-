export default {
    commands: ["del", "delete"],
    category: "admin",
    admin: true, // solo admins

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // SOLO FUNCIONA EN GRUPOS
        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        // USUARIO DEBE SER ADMIN
        if (!ctx.isAdmin) {
            return sock.sendMessage(jid, { text: "❌ Solo administradores pueden usar .del" });
        }

        // BOT DEBE SER ADMIN
        if (!ctx.isBotAdmin) {
            return sock.sendMessage(jid, { text: "❌ Necesito ser admin para borrar mensajes." });
        }

        // VERIFICAR SI RESPONDISTE UN MENSAJE
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.stanzaId) {
            return sock.sendMessage(jid, { text: "⚠️ Debes responder al mensaje que quieres borrar." });
        }

        try {
            await sock.sendMessage(jid, {
                delete: {
                    id: quoted.stanzaId,
                    remoteJid: jid,
                    participant: quoted.participant || quoted.participant || undefined
                }
            });
        } catch (e) {
            console.error(e);
            return sock.sendMessage(jid, { text: "❌ No pude borrar ese mensaje." });
        }
    }
};
