export default {
    commands: ["del", "delete"],
    category: "admin",
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // SOLO GRUPOS
        if (!ctx.isGroup) {
            return sock.sendMessage(jid, {
                text: "❌ Este comando solo funciona en grupos."
            }, { quoted: msg });
        }

        // SOLO ADMINS
        if (!ctx.isAdmin) {
            return sock.sendMessage(jid, {
                text: "❌ Solo administradores pueden usar .del"
            }, { quoted: msg });
        }

        // 🔥 DETECTAR MENSAJE RESPONDIDO (FIX REAL)
        const context =
            msg.message?.extendedTextMessage?.contextInfo ||
            msg.message?.imageMessage?.contextInfo ||
            msg.message?.videoMessage?.contextInfo ||
            msg.message?.documentMessage?.contextInfo ||
            msg.message?.stickerMessage?.contextInfo ||
            msg.message?.audioMessage?.contextInfo ||
            {};

        if (!context?.stanzaId) {
            return sock.sendMessage(jid, {
                text: "⚠️ Responde al mensaje que quieres borrar."
            }, { quoted: msg });
        }

        try {
            // 🔥 BORRAR MENSAJE
            await sock.sendMessage(jid, {
                delete: {
                    remoteJid: jid,
                    fromMe: false,
                    id: context.stanzaId,
                    participant: context.participant
                }
            });

            // 🔥 OPCIONAL: REACCIÓN
            await sock.sendMessage(jid, {
                react: {
                    text: "🗑️",
                    key: msg.key
                }
            });

        } catch (e) {
            console.error(e);

            return sock.sendMessage(jid, {
                text: "❌ No pude borrar el mensaje. Verifica que soy admin."
            }, { quoted: msg });
        }
    }
};