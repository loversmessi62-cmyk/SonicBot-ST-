import fs from "fs";
import path from "path";

export default {
    commands: ["menu", "help"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        let user = ctx.sender;
        let username = user.split("@")[0];

        const menuImg = "https://files.catbox.moe/zni6xn.jpg";

        // -------------------------------
        //  LEER TODOS LOS PLUGINS
        // -------------------------------
        const pluginsDir = "./plugins";
        const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

        // Listas dinámicas
        let generales = [];
        let admins = [];
        let config = [];
        let owner = [];

        // Clasificar plugins por categoría
        for (let file of files) {
            try {
                const module = await import("file://" + path.resolve(`${pluginsDir}/${file}`));

                const cmds = module.default.commands || module.default.command;
                const categoria = module.default.category || "general";

                if (!cmds) continue;

                // Convertir single → array
                const comandoLista = Array.isArray(cmds) ? cmds : [cmds];

                switch (categoria.toLowerCase()) {
                    case "admins":
                    case "admin":
                        admins.push(...comandoLista);
                        break;
                    case "config":
                    case "on/off":
                        config.push(...comandoLista);
                        break;
                    case "owner":
                        owner.push(...comandoLista);
                        break;
                    default:
                        generales.push(...comandoLista);
                        break;
                }

            } catch (e) {
                console.log("Error leyendo plugin:", file, e);
            }
        }

        // -------------------------------
        //  CONSTRUIR MENÚ PROFESIONAL
        // -------------------------------
        const texto = `
╭───「 ADRIBOT-DH 」───
│
│ 👤 Usuario: @${username}
│ 📅 Fecha: ${new Date().toLocaleDateString("es-MX")}
│
├──「 📌 COMANDOS GENERALES 」
${generales.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 🛠️ ADMINISTRACIÓN 」
${admins.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 🔐 CONFIGURACIÓN 」
${config.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 👑 OWNER 」
${owner.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

╰─────────────────────●
`;

        // -------------------------------
        //  ENVIAR MENÚ
        // -------------------------------
        await sock.sendMessage(jid, {
            image: { url: menuImg },
            caption: texto,
            mentions: [user]
        });
    }
};
