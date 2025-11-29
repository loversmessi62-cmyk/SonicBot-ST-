export default {
    commands: ["todos"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Texto que envía el admin
        const texto = args.join(" ").trim() || "Mensaje para todos:";

        // Lista de participantes del grupo
        const participantes = ctx.groupMetadata.participants.map(u => u.id);

        // Crear lista @tag por línea
        const listaTags = participantes
            .map(id => "@" + id.split("@")[0])
            .join("\n");

        const mensaje = `${texto}\n\n${listaTags}`;

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
