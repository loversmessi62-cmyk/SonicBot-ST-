export default {
    commands: ["fantasmas"],
    category: "grupo",
    admin: true,
    description: "Muestra quiénes no han hablado recientemente.",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        // ------------------------------
        //  OBTENER ÚLTIMOS MENSAJES
        // ------------------------------
        let mensajes = [];
        try {
            mensajes = await sock.fetchMessages(jid, { limit: 200 });
        } catch (e) {
            console.log("ERROR FETCH:", e);
            return sock.sendMessage(jid, { text: "❌ No pude obtener los mensajes del grupo." });
        }

        const activos = new Set(
            mensajes
                .filter(m => m?.key?.participant)
                .map(m => m.key.participant)
        );

        // Lista completa del grupo
        const participantes = ctx.groupMetadata.participants.map(p => p.id);

        // Usuarios que NO han enviado mensajes
        const fantasmas = participantes.filter(id => !activos.has(id));

        if (fantasmas.length === 0) {
            return sock.sendMessage(jid, { text: "✨ No hay fantasmas, todos han hablado recientemente." });
        }

        const lista = fantasmas.map(u => `👻 @${u.split("@")[0]}`).join("\n");

        await sock.sendMessage(jid, {
            text: `*👻 FANTASMAS DETECTADOS*\n\n${lista}`,
            mentions: fantasmas
        });
    }
};
