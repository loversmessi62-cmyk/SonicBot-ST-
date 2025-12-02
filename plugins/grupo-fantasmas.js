import { store } from "../index.js"; // <-- AJUSTA ESTA RUTA si tu store se exporta en otro lado

export default {
    commands: ["fantasmas", "kickfantasmas"],
    admin: true,
    category: "grupo",

    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        // OBTENER MIEMBROS DEL GRUPO
        const group = await sock.groupMetadata(jid);
        const participantes = group.participants.map(p => p.id);

        // MENSAJES RECIENTES DESDE STORE
        const mensajesGrupo = store.messages.get(jid) || [];

        // USUARIOS QUE SÍ HAN ESCRITO
        const activos = new Set();

        for (const m of mensajesGrupo) {
            const autor =
                m.key.participant ||
                m.participant ||
                m.key.remoteJid;

            if (autor) {
                activos.add(autor.replace(/:[0-9]+/g, ""));
            }
        }

        // FILTRAR FANTASMAS
        const fantasmas = participantes.filter(u => !activos.has(u));

        // ========= COMANDO: .fantasmas ==========
        if (msg.body.startsWith(".fantasmas")) {

            if (fantasmas.length === 0)
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas, todos están activos." });

            const texto =
                `👻 *Fantasmas detectados* 👻\n\n` +
                fantasmas.map(u => `@${u.split("@")[0]}`).join("\n");

            return sock.sendMessage(jid, {
                text: texto,
                mentions: fantasmas
            });
        }

        // ========= COMANDO: .kickfantasmas ==========
        if (msg.body.startsWith(".kickfantasmas")) {

            if (!ctx.isAdmin)
                return sock.sendMessage(jid, { text: "❌ Necesito permisos de admin para expulsar." });

            if (fantasmas.length === 0)
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas que expulsar." });

            await sock.sendMessage(jid, {
                text: `👢 *Expulsando fantasmas...*\n\n${fantasmas.map(u => "@" + u.split("@")[0]).join("\n")}`,
                mentions: fantasmas
            });

            // Expulsar con delay para evitar bloqueos
            for (const user of fantasmas) {
                await sock.groupParticipantsUpdate(jid, [user], "remove");
                await new Promise(res => setTimeout(res, 500));
            }
        }
    }
};
