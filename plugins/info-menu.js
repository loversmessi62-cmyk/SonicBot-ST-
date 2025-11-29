export default {
    commands: ["menu"],

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text: `📌 *MENÚ PROFESIONAL*\n
• .menu  – Mostrar menú
• .n <texto>  – Aviso del admin
• .todos <texto> – Mencionar a todos`
        }, { quoted: msg });
    }
};
