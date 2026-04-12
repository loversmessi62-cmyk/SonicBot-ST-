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

        // 🔥 OBTENER CONTEXT INFO BIEN (CLAVE)
        const context =
            msg.message?.extendedTextMessage?.contextInfo ||
            msg.message?.imageMessage?.contextInfo ||
            msg.message?.videoMessage?.contextInfo ||
            msg.message?.documentMessage?.contextInfo ||
            msg.message?.conversation?.contextInfo ||
            {};

        if (!context?.stanzaId) {
            return sock.sendMessage(jid, {
                text: "⚠️ Responde al mensaje que quieres borrar."
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, {
                delete: {
                    remoteJid: jid,
                    fromMe: false,
                    id: context.stanzaId,
                    participant: context.participant
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