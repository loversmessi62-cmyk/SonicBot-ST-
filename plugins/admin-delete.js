export default {
    commands: ["del", "delete"],
    admin: true,
    category: "admin",

    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;

        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        // usuario admin
        if (!ctx.isAdmin) {
            return sock.sendMessage(jid, { text: "❌ Solo los administradores pueden usar .del" });
        }

        // BOT ADMIN (tu handler no usa ctx.isBotAdmin, usa ctx.botAdmin)
        if (!ctx.botAdmin) {
            return sock.sendMessage(jid, { text: "❌ Necesito ser administrador para borrar mensajes." });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.stanzaId) {
            return sock.sendMessage(jid, { text: "⚠️ Debes responder al mensaje que quieres borrar." });
        }

        try {
            await sock.sendMessage(jid, {
                delete: {
                    id: quoted.stanzaId,
                    remoteJid: jid,
                    participant: quoted.participant || undefined
                }
            });
        } catch (e) {
            console.error(e);
            await sock.sendMessage(jid, { text: "❌ No pude eliminar ese mensaje." });
        }
    }
};
