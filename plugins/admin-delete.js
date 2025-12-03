export default {
    commands: ["del", "delete"],
    admin: true,
    category: "admin",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Debe ser grupo
        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        // Necesita ser admin el que ejecuta el comando
        if (!ctx.isAdmin) {
            return sock.sendMessage(jid, { text: "❌ Solo los administradores pueden borrar mensajes." });
        }

        // Mensaje citado
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.stanzaId) {
            return sock.sendMessage(jid, { text: "⚠️ Debes responder al mensaje que quieres borrar." });
        }

        // Bot debe ser admin
        if (!ctx.isBotAdmin) {
            return sock.sendMessage(jid, { text: "❌ Necesito ser administrador para eliminar mensajes." });
        }

        try {
            await sock.sendMessage(jid, {
                delete: {
                    id: quoted.stanzaId,
                    remoteJid: jid,
                    participant: quoted.participant || quoted.participantJid || undefined
                }
            });
        } catch (error) {
            console.error("Error al borrar:", error);
            await sock.sendMessage(jid, { text: "❌ No pude borrar ese mensaje." });
        }
    }
};
