export default {
    commands: ["menu", "help"],
    admin: false,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Obtener el usuario correctamente
        let user = msg.key.participant || msg.key.remoteJid;
        let username = String(user).split("@")[0];

        const menuImg = "https://files.catbox.moe/zni6xn.jpg";

        const texto = `
╭───「 ADRIBOT-DH 」───
│
│  Usuario: @${username}
│  Fecha: ${new Date().toLocaleDateString("es-MX")}
│
├── COMANDOS GENERALES
│  • .menu
│  • .sticker
│  • .link
│  • .fantasmas
│
├── ADMINISTRACIÓN
│  • .kick
│  • .promote
│  • .demote
│  • .mute
│  • .unmute
│  • .grupo abrir
│  • .grupo cerrar
│
╰───────────────────●
`;

        await sock.sendMessage(jid, {
            image: { url: menuImg },
            caption: texto,
            mentions: [user]
        });
    }
};
