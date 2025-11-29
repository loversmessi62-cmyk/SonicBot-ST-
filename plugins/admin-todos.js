import config from "../config.js";

export default {
    commands: ["todos", "tagall", "invocar"],

    run: async (sock, msg, args, ctx) => {
        const { isGroup, isAdmin, isBotAdmin, groupMetadata } = ctx;
        const jid = msg.key.remoteJid;

        if (!isGroup)
            return sock.sendMessage(jid, { text: config.messages.group });

        if (!isAdmin)
            return sock.sendMessage(jid, { text: config.messages.admin });

        if (!isBotAdmin)
            return sock.sendMessage(jid, { text: "❌ Necesito ser admin para mencionar a todos." });

        const texto = args.join(" ") || "📢 *Atención a todos*";

        let participantes = groupMetadata.participants;
        let menciones = participantes.map(u => u.id);

        // Construir lista de usuarios
        let lista = "";
        for (let user of participantes) {
            lista += `➤ @${user.id.split("@")[0]}\n`;
        }

        await sock.sendMessage(jid, {
            text: `${texto}\n\n${lista}`,
            mentions: menciones
        });
    }
};
