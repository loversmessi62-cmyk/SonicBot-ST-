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

        // 🔥 FIX REAL: normalizar ID del bot
        const metadata = await sock.groupMetadata(jid);

        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

        const bot = metadata.participants.find(p => p.id === botId);

        if (!bot || !bot.admin) {
            return sock.sendMessage(jid, { text: "❌ Necesito ser admin para borrar mensajes." }, { quoted: msg });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted?.stanzaId) {
            return sock.sendMessage(jid, { text: "⚠️ Responde al mensaje que quieres borrar." }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, {
                delete: {
                    id: quoted.stanzaId,
                    remoteJid: jid,
                    participant: quoted.participant
                }
            });
        } catch (e) {
            console.error(e);
            return sock.sendMessage(jid, { text: "❌ No pude borrar ese mensaje." }, { quoted: msg });
        }
    }
};