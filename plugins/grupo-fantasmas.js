import { store } from "../index.js"; // ajusta si tu store está en otro archivo

export default {
    commands: ["fantasmas", "kickfantasmas"],
    admin: true,
    category: "grupo",

    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const comando = ctx.body?.toLowerCase() || "";

        // Obtener participantes del grupo
        const group = await sock.groupMetadata(jid);
        const participantes = group.participants.map(p => p.id);

        // Obtener mensajes del STORE
        const mensajesGrupo = store.messages.get(jid) || [];

        // Usuarios activos
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

        // Filtrar fantasmas
        const fantasmas = participantes.filter(u => !activos.has(u));

        // -------------------------------
        // COMANDO: .fantasmas
        // -------------------------------
        if (comando.startsWith(".fantasmas")) {

            if (fantasmas.length === 0)
                return sock.sendMessage(jid, { text: "✨ No hay usuarios inactivos." });

            return sock.sendMessage(jid, {
                text:
                    "👻 *Usuarios inactivos detectados:*\n\n" +
                    fantasmas.map(u => `@${u.split("@")[0]}`).join("\n"),
                mentions: fantasmas
            });
        }

        // -------------------------------
        // COMANDO: .kickfantasmas
        // -------------------------------
        if (comando.startsWith(".kickfantasmas")) {

            if (!ctx.isAdmin)
                return sock.sendMessage(jid, { text: "❌ No tienes permisos para expulsar." });

            if (fantasmas.length === 0)
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas que expulsar." });

            await sock.sendMessage(jid, {
                text:
                    "👢 *Expulsando fantasmas...*\n\n" +
                    fantasmas.map(u => `@${u.split("@")[0]}`).join("\n"),
                mentions: fantasmas
            });

            for (const user of fantasmas) {
                await sock.groupParticipantsUpdate(jid, [user], "remove");
                await new Promise(res => setTimeout(res, 400));
            }
        }
    }
};
