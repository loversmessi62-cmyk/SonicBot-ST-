export default {
    commands: ["fantasmas", "kickfantasmas"],
    admin: true,
    category: "grupo",

    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;

        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Solo funciona en grupos." });
        }

        // OBTENER MIEMBROS DEL GRUPO
        const group = await sock.groupMetadata(jid);
        const participantes = group.participants.map(p => p.id);

        // OBTENER HISTORIAL RECIENTE DEL GRUPO
        // entre 200-300 mensajes es lo ideal para máxima precisión
        const chatHistory = await sock.fetchMessages(jid, { limit: 250 });

        // OBTENER QUIÉNES HAN ESCRITO RECIENTEMENTE
        const activos = new Set();

        for (const m of chatHistory) {
            const author =
                m.key?.participant ||
                m.participant ||
                m.key?.remoteJid;

            if (author) activos.add(author.replace(/:[0-9]+/g, ""));
        }

        // FILTRAR A LOS QUE NO HAN ESCRITO
        const fantasmas = participantes.filter(u => !activos.has(u));

        // ========= COMANDO: .fantasmas ==========
        if (msg.body.startsWith(".fantasmas")) {

            if (fantasmas.length === 0) {
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas, todos están activos." });
            }

            const texto = `👻 *Lista de fantasmas detectados*\n\n` +
                fantasmas.map(u => `@${u.split('@')[0]}`).join("\n");

            return sock.sendMessage(
                jid,
                { text: texto, mentions: fantasmas }
            );
        }

        // ========= COMANDO: .kickfantasmas ==========
        if (msg.body.startsWith(".kickfantasmas")) {

            if (!ctx.isAdmin) {
                return sock.sendMessage(jid, { text: "❌ Solo admins pueden expulsar." });
            }

            if (fantasmas.length === 0) {
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas para expulsar." });
            }

            await sock.sendMessage(jid, {
                text: `👢 *Expulsando fantasmas...*\n\n${fantasmas.map(u => "@" + u.split("@")[0]).join("\n")}`,
                mentions: fantasmas
            });

            for (const user of fantasmas) {
                await sock.groupParticipantsUpdate(jid, [user], "remove");
                await new Promise(res => setTimeout(res, 500)); // evita bloqueo
            }

        }
    }
};
