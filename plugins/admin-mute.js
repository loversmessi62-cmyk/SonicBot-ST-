import { muteUser } from "../utils/muteState.js";

export default {
    commands: ["mute"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target)
            return sock.sendMessage(ctx.jid, {
                text: "❌ Responde al usuario que quieres mutear."
            }, { quoted: msg });

        muteUser(ctx.jid, target);

        await sock.sendMessage(ctx.jid, {
            text: `🔇 Usuario muteado:\n@${target.split("@")[0]}`,
            mentions: [target]
        });
    }
};
