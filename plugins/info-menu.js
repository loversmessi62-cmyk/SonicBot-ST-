export default {
    commands: ["menu", "help", "ayuda"],
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        const plugins = ctx.plugins; // 👈 viene del handler
        const isAdmin = ctx.isAdmin;

        // -----------------------------
        // AGRUPAR COMANDOS POR CATEGORÍA
        // -----------------------------
        const categorias = {};

        for (const name in plugins) {
            const plg = plugins[name];

            // saltar plugins sin comandos
            if (!plg.commands) continue;

            // categoría
            const cat = plg.category || "otros";

            if (!categorias[cat]) categorias[cat] = [];

            // mostrar solo comandos que NO sean solo admin
            if (!plg.admin || isAdmin) {
                categorias[cat].push(...plg.commands);
            }
        }

        // -----------------------------
        // CONSTRUIR TEXTO DEL MENÚ
        // -----------------------------
        let texto = `🔥 *ADRI-BOT MENU*\n`;
        texto += `👤 Admin: *${isAdmin ? "Sí" : "No"}*\n`;
        texto += `🔧 Plugins cargados: ${Object.keys(plugins).length}\n`;
        texto += `===========================\n\n`;

        for (const cat in categorias) {
            texto += `💠 *${cat.toUpperCase()}*\n`;

            categorias[cat].forEach(cmd => {
                texto += `   • .${cmd}\n`;
            });

            texto += `\n`;
        }

        texto += `===========================\n`;
        texto += `✨ Bot by Adri`;

        // -----------------------------
        // ENVIAR MENU
        // -----------------------------
        await sock.sendMessage(jid, { text: texto });
    }
};
