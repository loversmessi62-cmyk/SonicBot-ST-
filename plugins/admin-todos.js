export default {
    commands: ["todos"],
    admin: true,

    async run(sock, msg, args, ctx) {

        // Verificar grupo
        if (!ctx.isGroup) {
            return sock.sendMessage(ctx.jid, {
                text: "❌ Este comando solo funciona en grupos."
            });
        }

        // Texto del admin
        const texto = args.join(" ").trim() || "📢 Mensaje para todos:";

        // Obtener metadata REAL del grupo
        let metadata;
        try {
            metadata = await sock.groupMetadata(ctx.jid);
        } catch (e) {
            console.error("Error al obtener metadata:", e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ No pude obtener la lista de participantes."
            });
        }

        // Validar metadata
        if (!metadata || !metadata.participants) {
            return sock.sendMessage(ctx.jid, {
                text: "❌ No pude obtener los participantes del grupo."
            });
        }

        // IDs
        const participantes = metadata.participants.map(p => p.id);

        // Construir lista
        const listaTags = participantes
            .map(id => `@${id.split("@")[0]}`)
            .join("\n");

        const mensaje = `${texto}\n\n${listaTags}`;

        // Enviar
        await sock.sendMessage(ctx.jid, {
            text: mensaje,
            mentions: participantes
        });
    }
};
