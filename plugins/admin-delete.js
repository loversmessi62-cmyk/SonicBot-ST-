const mantenimiento = false; // 🔥 pon true si quieres activar mantenimiento

export default {
    commands: ["del", "delete"],
    category: "admin",
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // 🔧 MODO MANTENIMIENTO
        if (mantenimiento) {
            return sock.sendMessage(jid, {
                text: "⚠️ El comando .del está en mantenimiento.\n\n🛠️ Estamos trabajando para mejorarlo y pronto estará disponible nuevamente. 🙏"
            }, { quoted: msg });
        }

        // ❌ Solo grupos
        if (!ctx.isGroup) {
            return sock.sendMessage(jid, {
                text: "❌ Este comando solo funciona en grupos."
            }, { quoted: msg });
        }

        // ❌ Solo admins
        if (!ctx.isAdmin) {
            return sock.sendMessage(jid, {
                text: "❌ Solo administradores pueden usar .del"
            }, { quoted: msg });
        }

        // 🔥 DETECTAR MENSAJE CITADO (TODO TIPO)
        const context =
            msg.message?.extendedTextMessage?.contextInfo ||
            msg.message?.imageMessage?.contextInfo ||
            msg.message?.videoMessage?.contextInfo ||
            msg.message?.documentMessage?.contextInfo ||
            msg.message?.stickerMessage?.contextInfo ||
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

            // 🔁 fallback (por si falla el participant)
            try {
                await sock.sendMessage(jid, {
                    delete: {
                        remoteJid: jid,
                        id: context.stanzaId
                    }
                });
            } catch (err) {
                return sock.sendMessage(jid, {
                    text: "❌ No pude borrar el mensaje. Verifica que soy admin."
                }, { quoted: msg });
            }
        }
    }
};