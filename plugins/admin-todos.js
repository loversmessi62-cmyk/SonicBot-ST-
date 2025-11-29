export default {
    commands: ["todos"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Texto del mensaje
        const texto = args.join(" ") || "📢 Mensaje para todos:";

        // Obtener todos los participantes
        const participantes = ctx.groupMetadata.participants.map(p => p.id);

        // Convertir a formato @tag por línea
        const tagsLista = participantes
            .map(j => "@" + j.split("@")[0])
            .join("\n");

        await sock.sendMessage(jid, {
            text: `👥 *Mención a todos*\n\n${texto}\n\n${tagsLista}`,
            mentions: participantes
        }, { quoted: msg });
    }
};
