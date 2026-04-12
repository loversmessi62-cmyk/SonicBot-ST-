export default {
    commands: ["del", "delete"],
    category: "admin",
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        if (!ctx.isGroup) {
            return sock.sendMessage(jid, {
                text: "❌ Este comando solo funciona en grupos."
            }, { quoted: msg });
        }

        if (!ctx.isAdmin) {
            return sock.sendMessage(jid, {
                text: "❌ Solo administradores pueden usar .del"
            }, { quoted: msg });
        }

        // 📩 obtener mensaje citado correctamente
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted?.stanzaId) {
            return sock.sendMessage(jid, {
                text: "⚠️ Responde al mensaje que quieres borrar."
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, {
                delete: {
                    remoteJid: jid,
                    fromMe: false, // 🔥 CLAVE
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });

        } catch (e) {
            console.error(e);

            return sock.sendMessage(jid, {
                text: "❌ No pude borrar el mensaje."
            }, { quoted: msg });
        }
    }
};