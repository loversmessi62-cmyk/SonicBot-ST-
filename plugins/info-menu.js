import config from "../config.js";

export default {
    commands: ["menu", "help"],
    
    run: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        const menu = `
╭─⬣  *${config.botName}*
│  Prefijo: *${config.prefix}*
│
├─ ⚙️ *Comandos*
│  .menu
│  .ping
│
├─ 👑 *Admin*
│  .kick
│  .promote
│  .demote
│
└─ 🎭 *Diversión*
   .manco
   .camara
   .asustar
   .amigo
        `;

        await sock.sendMessage(jid, { text: menu });
    }
};
