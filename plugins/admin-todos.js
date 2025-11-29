import config from "../config.js";

export default {
    commands: ["todos", "all", "tagall"],

    run: async (sock, msg, args, ctx) => {
        const { isGroup, isAdmin, groupMetadata } = ctx;
        const jid = msg.key.remoteJid;

        if (!isGroup)
            return sock.sendMessage(jid, { text: config.messages.group });

        if (!isAdmin)
            return sock.sendMessage(jid, { text: config.messages.admin });

        const texto = args.join(" ") || "📢 *Atención a todos!*";

        const menciones = groupMetadata.participants.map(p => p.id);

        let mensaje = `👥 *MENCIÓN MASIVA:*\n${texto}\n\n`;

        for (let user of groupMetadata.participants) {
            mensaje += `• @${user.id.split("@")[0]}\n`;
        }

        await sock.sendMessage(jid, {
            text: mensaje,
            mentions: menciones
        });
    }
};
