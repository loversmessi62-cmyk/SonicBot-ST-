import fs from "fs";

export default {
    commands: ["mute"],
    category: "admin",
    admin: true,
    description: "Borra todos los mensajes del usuario muteado.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;
        const file = "./mutelist.json";

        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target)
            return sock.sendMessage(jid, { text: "❌ Responde a quien quieres mutear." }, { quoted: msg });

        let data = [];
        if (fs.existsSync(file)) data = JSON.parse(fs.readFileSync(file));

        if (!data.includes(target)) data.push(target);

        fs.writeFileSync(file, JSON.stringify(data));

        await sock.sendMessage(jid, {
            text: `🔇 Usuario muteado:\n@${target.split("@")[0]}`,
            mentions: [target]
        });
    }
};
