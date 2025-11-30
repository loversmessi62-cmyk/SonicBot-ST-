export default {
    commands: ["todos"],
    admin: true,

    async run(sock, msg, args, ctx) {

        // Verificar que sea grupo
        if (!ctx.isGroup) {
            return sock.sendMessage(ctx.jid, {
                text: "❌ Este comando solo funciona en grupos."
            });
        }

        // Mensaje del admin
        const texto = args.join(" ").trim() || "📢 Mensaje para todos:";

        // Obtener metadata REAL del grupo
        let metadata;
        try {
            metadata = await sock.groupMetadata(ctx.jid);
        } catch (e) {
            console.error("Error al obtener metadata:", e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ No pude obtener la lista del grupo."
            });
        }

        if (!metadata || !metadata.participants) {
            return sock.sendMessage(ctx.jid, {
                text: "❌ No pude acceder a los participantes."
            });
        }

        // Lista de IDs
        const participantes = metadata.participants.map(p => p.id);

        // Crear lista @tag
        const listaTags = participantes
            .map(id => "@" + id.split("@")[0])
            .join("\n");

        const mensaje = `${texto}\n\n${listaTags}`;

        // Enviar mensaje etiquetando a todos
        await sock.sendMessage(ctx.jid, {
            text: mensaje,
            mentions: participantes
        });
    }
};
