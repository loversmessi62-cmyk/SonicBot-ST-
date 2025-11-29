export default {
    commands: ["todos"],
    adminOnly: true,

    async run(sock, msg) {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text: "🔊 @todos",
            mentions: []
        }, { quoted: msg });
    }
};
