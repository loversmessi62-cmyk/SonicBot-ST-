export default {
    commands: ["menu", "help"],
    admin: false,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        const menuImg = " https://files.catbox.moe/zni6xn.jpg; 
        // Puedes cambiar esta imagen por la que tú quieras

        const texto = `
╭───「 *🌐 ADRIBOT-DH* 」───
│
│  👤 *Usuario:* @${msg.sender.split("@")[0]}
│  📅 *Fecha:* ${new Date().toLocaleDateString("es-MX")}
│
├───「 📁 COMANDOS GENERALES 」
│  • .menu
│  • .sticker
│  • .link
│  • .fantasmas
│
├───「 🛡️ ADMINISTRACIÓN 」
│  • .kick
│  • .promote
│  • .demote
│  • .mute
│  • .unmute
│  • .grupo abrir
│  • .grupo cerrar
│
╰───────────────●`;

        await sock.sendMessage(jid, {
            image: { url: menuImg },
            caption: texto,
            mentions: [msg.sender]
        });
    }
};
