export default {
    commands: ["abrir"],
    category: "grupo",
    admin: true,
    description: "Abre el grupo para que todos escriban.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        await sock.groupSettingUpdate(jid, "not_announcement");
        await sock.sendMessage(jid, { text: "🔓 *Grupo abierto.*" }, { quoted: msg });
    }
};
