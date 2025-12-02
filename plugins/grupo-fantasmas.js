import { store } from "../index.js"; // AJUSTA si tu store está en otro archivo

export default {
    commands: ["fantasmas", "kickfantasmas"],
    admin: true,
    category: "grupo",

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const command = ctx.args?.length >= 0
            ? msg.message.conversation?.slice(1).split(" ")[0].toLowerCase()
            : "";

        // Obtener participantes reales
        const group = await sock.groupMetadata(jid);
        const participantes = group.participants.map(p => p.id);

        // Mensajes guardados del store
        const mensajesGrupo = store.messages.get(jid) || [];

        const activos = new Set();

        for (const m of mensajesGrupo) {
            const autor =
                m.key.participant ||
                m.participant ||
                m.key.remoteJid;

            if (autor)
                activos.add(autor.replace(/:[0-9]+/g, ""));
        }

        // Filtrar inactivos
        const fantasmas = participantes.filter(u => !activos.has(u));

        // ============================
        //   .fantasmas
        // ============================
        if (ctx.msg.message.conversation?.startsWith(".fantasmas") ||
            ctx.msg.message?.extendedTextMessage?.text?.startsWith(".fantasmas")) {

            if (fantasmas.length === 0)
                return sock.sendMessage(jid, { text: "✨ No hay usuarios inactivos." });

            return sock.sendMessage(jid, {
                text:
                    "👻 *Usuarios inactivos:*\n\n" +
                    fantasmas.map(u => `@${u.split("@")[0]}`).join("\n"),
                mentions: fantasmas
            });
        }

        // ============================
        //   .kickfantasmas
        // ============================
        if (ctx.msg.message.conversation?.startsWith(".kickfantasmas") ||
            ctx.msg.message?.extendedTextMessage?.text?.startsWith(".kickfantasmas")) {

            if (!ctx.isAdmin)
                return sock.sendMessage(jid, { text: "❌ Solo admins pueden expulsar." });

            if (fantasmas.length === 0)
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas que expulsar." });

            await sock.sendMessage(jid, {
                text:
                    "👢 *Expulsando fantasmas:*\n\n" +
                    fantasmas.map(u => `@${u.split("@")[0]}`).join("\n"),
                mentions: fantasmas
            });

            for (const user of fantasmas) {
                await sock.groupParticipantsUpdate(jid, [user], "remove");
                await new Promise(res => setTimeout(res, 350));
            }
        }
    }
};
