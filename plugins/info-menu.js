import config from "../config.js";

export default {
    commands: ["menu", "help"],

    run: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        const menu = `
╭─⬣  *${config.botName}*
│ Prefijo: *${config.prefix}*
│
├─ 📜 *Menú*
│  .menu
│  .todos
│  .n
│
└─ ✔️ Bot funcionando correctamente
        `;

        await sock.sendMessage(jid, { text: menu });
    }
};
