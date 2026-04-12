export default {
    commands: ["del", "delete"],
    category: "admin",
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." }, { quoted: msg });
        }

        if (!ctx.isAdmin) {
            return sock.sendMessage(jid, { text: "❌ Solo administradores pueden usar .del" }, { quoted: msg });
        }

        // 🔥 FIX: verificar admin REAL del bot
        const metadata = await sock.groupMetadata(jid);
        const bot = metadata.participants.find(p => p.id === sock.user.id);

        if (!bot?.admin) {
            return sock.sendMessage(jid, { text: "❌ Necesito ser admin para borrar mensajes." }, { quoted: msg });
        }

        // 📩 mensaje citado
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted?.stanzaId) {
            return sock.sendMessage(jid, { text: "⚠️ Debes responder al mensaje que quieres borrar." }, { quoted: msg });
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
            return sock.sendMessage(jid, { text: "❌ No pude borrar ese mensaje." }, { quoted: msg });
        }
    }
};