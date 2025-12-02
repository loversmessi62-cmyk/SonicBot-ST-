export default {
    commands: ["fantasmas"],
    admin: true,
    category: "grupo",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Store
        const store = sock.store;
        if (!store) return sock.sendMessage(jid, { text: "⚠️ No hay store disponible." });

        const mensajes = store.messages[jid];
        if (!mensajes) {
            return sock.sendMessage(jid, { text: "⚠️ No hay historial de mensajes para analizar." });
        }

        // Días para revisar
        const dias = parseInt(args[0]) || 7;
        const limite = Date.now() - dias * 24 * 60 * 60 * 1000;

        // Lista de miembros
        const miembros = ctx.participants.map(u => u.id);

        // Últimos mensajes por usuario
        const ultimoMensaje = {};

        for (let m of mensajes) {
            const sender = m.key.participant || m.key.remoteJid;
            if (!sender) continue;

            const timestamp = (m.messageTimestamp || 0) * 1000;
            if (!ultimoMensaje[sender] || timestamp > ultimoMensaje[sender]) {
                ultimoMensaje[sender] = timestamp;
            }
        }

        // Buscar inactivos
        const fantasmas = miembros.filter(id => {
            return !ultimoMensaje[id] || ultimoMensaje[id] < limite;
        });

        if (fantasmas.length === 0) {
            return sock.sendMessage(jid, { text: `🌟 No hay fantasmas en los últimos *${dias} días*.` });
        }

        await sock.sendMessage(jid, {
            text:
                `👻 *Fantasmas ${dias} días:*\n\n` +
                fantasmas.map(f => `• @${f.split("@")[0]}`).join("\n"),
            mentions: fantasmas
        });
    }
};
