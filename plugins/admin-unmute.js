import fs from "fs";

export default {
    commands: ["unmute"],
    category: "admin",
    admin: true,
    description: "Le permite escribir a un usuario nuevamente.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;
        const file = "./mutelist.json";

        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target)
            return sock.sendMessage(jid, { text: "❌ Responde al usuario que quieres desmutear." }, { quoted: msg });

        let data = [];
        if (fs.existsSync(file)) data = JSON.parse(fs.readFileSync(file));

        data = data.filter(u => u !== target);

        fs.writeFileSync(file, JSON.stringify(data));

        await sock.sendMessage(jid, {
            text: `🔊 Usuario desmuteado:\n@${target.split("@")[0]}`,
            mentions: [target]
        });
    }
};
