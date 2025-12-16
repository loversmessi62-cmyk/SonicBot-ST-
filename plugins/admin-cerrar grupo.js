export default {
    commands: ["cerrar"],
    category: "grupo",
    admin: true,
    description: "Cierra el grupo para que solo administradores escriban.",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        await sock.groupSettingUpdate(jid, "announcement");
        await sock.sendMessage(jid, { text: "🔒 *Grupo cerrado.*" }, { quoted: msg });
    }
};
