import { muteUser } from "../utils/muteState.js";

export default {
    commands: ["mute"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const context = msg.message?.extendedTextMessage?.contextInfo || {};

        let target =
            context.mentionedJid?.[0] ||
            context.participant;

        if (!target) {
            return sock.sendMessage(ctx.jid, {
                text: "❌ Responde o menciona al usuario que quieres mutear."
            }, { quoted: msg });
        }

        muteUser(ctx.jid, target);

        await sock.sendMessage(ctx.jid, {
            text: `🔇 Usuario muteado:\n@${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: msg });
    }
};