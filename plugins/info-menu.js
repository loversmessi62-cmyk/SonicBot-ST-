export default {
    commands: ["menu", "help", "ayuda"],
    category: "general",
    description: "Muestra el menú del bot.",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        const plugins = ctx.plugins; // <- VIENE DEL HANDLER

        if (!plugins || typeof plugins !== "object") {
            return sock.sendMessage(jid, { text: "❌ Error: plugins no cargados." });
        }

        // Agrupar por categorías
        const categorias = {};

        for (const name in plugins) {
            const plugin = plugins[name];

            if (!plugin) continue; // seguridad
            if (!plugin.commands) continue; // seguridad

            // Si no tiene categoría, lo mandamos a "otros"
            const categoria = plugin.category || "otros";

            if (!categorias[categoria]) categorias[categoria] = [];

            // Acepta comandos array o string
            const cmds = Array.isArray(plugin.commands)
                ? plugin.commands.join(", ")
                : plugin.commands;

            categorias[categoria].push({
                name: cmds,
                desc: plugin.description || "Sin descripción"
            });
        }

        // Generar el texto bonito
        let texto = `🤖 *MENÚ DEL BOT*\n`;

        for (const cat in categorias) {
            texto += `\n📂 *${cat.toUpperCase()}*\n`;

            for (const cmd of categorias[cat]) {
                texto += `🔹 *${cmd.name}* — ${cmd.desc}\n`;
            }
        }

        await sock.sendMessage(jid, { text: texto }, { quoted: msg });
    }
};
