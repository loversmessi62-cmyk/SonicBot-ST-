export default {
    commands: ["todos"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Solo funciona en grupos." });

        const texto = args.join(" ").trim() || "Mensaje para todos:";

        const participantes = ctx.participants.map(u => u.id);

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
