export default {
    commands: ["fantasmas"],
    category: "grupo",
    admin: true,
    description: "Muestra quiénes no han hablado recientemente.",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        const chat = await sock.loadMessages(jid, 100);
        const activos = new Set(chat.map(m => m.key.participant));

        const todos = ctx.groupMetadata.participants.map(p => p.id);
        const fantasmas = todos.filter(u => !activos.has(u));

        if (!fantasmas.length)
            return sock.sendMessage(jid, { text: "✨ No hay fantasmas, todos han hablado." }, { quoted: msg });

        const lista = fantasmas.map(u => "@" + u.split("@")[0]).join("\n");

        await sock.sendMessage(jid, {
            text: `👻 *Fantasmas detectados:*\n\n${lista}`,
            mentions: fantasmas
        }, { quoted: msg });
    }
};
