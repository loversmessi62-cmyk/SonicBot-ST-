export default {
    commands: ["todos"],
    admin: true,

    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;

        // Verificar si es grupo
        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, { text: "⚠️ Este comando solo funciona en grupos." }, { quoted: msg });
        }

        // Si ctx.groupMetadata NO existe, lo obtenemos manualmente
        let metadata = ctx.groupMetadata;
        if (!metadata) {
            metadata = await sock.groupMetadata(jid).catch(() => null);
        }

        // Si aun así no se pudo obtener metadata
        if (!metadata || !metadata.participants) {
            return sock.sendMessage(jid, { text: "❌ No se pudo obtener la lista de participantes." }, { quoted: msg });
        }

        // Texto del admin
        const texto = args.join(" ").trim() || "Mensaje para todos:";

        // Obtener IDs de participantes
        const participantes = metadata.participants.map(u => u.id);

        // Crear lista @tags por línea
        const listaTags = participantes
            .map(id => "@" + id.split("@")[0])
            .join("\n");

        const mensaje = `${texto}\n\n${listaTags}`;

        // Enviar mensaje mencionando a todos
        await sock.sendMessage(
            jid,
            {
                text: mensaje,
                mentions: participantes
            },
            { quoted: msg }
        );
    }
};
