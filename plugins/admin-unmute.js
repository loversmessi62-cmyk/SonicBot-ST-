import { unmuteUser } from "../utils/muteState.js";

export default {
    commands: ["unmute"],
    admin: true,
    category: "admin",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target)
            return sock.sendMessage(jid, {
                text: "❌ Responde al mensaje del usuario que quieres desmutear."
            }, { quoted: msg });

        unmuteUser(jid, target);

        await sock.sendMessage(jid, {
            text: `🔊 Usuario desmuteado:\n@${target.split("@")[0]}`,
            mentions: [target]
        });
    }
};
