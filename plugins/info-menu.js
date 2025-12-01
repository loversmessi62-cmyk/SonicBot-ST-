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

        // ===============================
        // LEER TODOS LOS PLUGINS
        // ===============================
        const pluginsDir = "./plugins";
        const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

        // Categorías reales de tu bot
        let admin = [];
        let owner = [];
        let info = [];
        let grupo = [];
        let multi = [];
        let onoff = [];
        let funny = [];
        let hot = []; // +18

        for (let file of files) {
            try {
                const module = await import("file://" + path.resolve(`${pluginsDir}/${file}`));

                const cmds = module.default.commands || module.default.command;
                const categoria = (module.default.category || "info").toLowerCase();

                if (!cmds) continue;

                const lista = Array.isArray(cmds) ? cmds : [cmds];

                switch (categoria) {
                    case "admin":
                        admin.push(...lista);
                        break;
                    case "owner":
                        owner.push(...lista);
                        break;
                    case "info":
                        info.push(...lista);
                        break;
                    case "grupo":
                        grupo.push(...lista);
                        break;
                    case "on-off":
                    case "onoff":
                    case "on/off":
                        onoff.push(...lista);
                        break;
                    case "funny":
                        funny.push(...lista);
                        break;
                    case "+18":
                    case "hot":
                    case "nsfw":
                        hot.push(...lista);
                        break;
                }

            } catch (e) {
                console.log("Error leyendo plugin:", file, e);
            }
        }

        // ===============================
        // FORMATO DE MENÚ BONITO
       // ===============================
        const texto = `
╭───「 ADRI BOT - DH 」───
│ 👤 Usuario: @${username}
│ 📅 Fecha: ${new Date().toLocaleDateString("es-MX")}
│
├──「 🛠️ ADMIN 」
${admin.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 👑 OWNER 」
${owner.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 📘 INFO 」
${info.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 👥 GRUPO 」
${grupo.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 🔧 ON-OFF 」
${onoff.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 😂 FUNNY 」
${funny.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

├──「 🔞 +18 」
${hot.map(c => `│ • .${c}`).join("\n") || "│ (Vacío)"}

╰─────────────────────●
`;

        // ===============================
        // ENVIAR MENÚ
        // ===============================
        await sock.sendMessage(jid, {
            image: { url: menuImg },
            caption: texto,
            mentions: [user]
        });
    }
};
