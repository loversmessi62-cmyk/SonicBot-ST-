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
        //  LEER MENSAJES DESDE EL STORE
        // ------------------------------
        let chatData;
        try {
            chatData = sock.store.loadMessages(jid);
        } catch (e) {
            console.log("ERROR STORE:", e);
            return sock.sendMessage(jid, { text: "❌ No pude acceder al historial del grupo." });
        }

        const mensajes = chatData?.messages || [];
        const activos = new Set(
            mensajes
                .filter(m => m?.key?.participant)
                .map(m => m.key.participant)
        );

        // Participantes del grupo
        const participantes = ctx.groupMetadata.participants.map(p => p.id);

        // Usuarios sin actividad reciente
        const fantasmas = participantes.filter(id => !activos.has(id));

        // Si no hay fantasmas
        if (!fantasmas.length) {
            return sock.sendMessage(jid, { text: "✨ No hay fantasmas, todos han hablado recientemente." });
        }

        // Construir lista
        const lista = fantasmas.map(u => `👻 @${u.split("@")[0]}`).join("\n");

        await sock.sendMessage(jid, {
            text: `*👻 FANTASMAS DETECTADOS*\n\n${lista}`,
            mentions: fantasmas
        });
    }
};
