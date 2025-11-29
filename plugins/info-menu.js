export default {
    commands: ["menu", "help"],

    run: async (sock, msg, args, ctx) => {
        const jid = msg.key.remoteJid;

        const menu = `
🌟 *ADRIBOT – MENÚ PRINCIPAL* 🌟

┌───────────────
│ 💬 *UTILIDAD*
│ • .menu
│ • .todos
│ • .n (solo admins)
└───────────────

⚡ Bot profesional cargado con plugins
        `.trim();

        await sock.sendMessage(jid, {
            text: menu
        });
    }
};
