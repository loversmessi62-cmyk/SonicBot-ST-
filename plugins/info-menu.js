import config from "../config.js";

export default {
    commands: ["menu", "help"],

    run: async (sock, m) => {
        const jid = m.key.remoteJid;

        const menu = `
╭─⬣ *${config.botName}*
│ Prefijo: *${config.prefix}*
│
├─ ⚙️ *Básicos*
│ .menu
│ .ping
│
├─ 👑 *Admin*
│ .todos
│ .n
│ .kick
│ .promote
│ .demote
│ .grupo abrir/cerrar
│
└─ 🎶 Música
   .play
        `;

        await sock.sendMessage(jid, { text: menu });
    }
};
