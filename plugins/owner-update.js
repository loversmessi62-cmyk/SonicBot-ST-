import { execSync } from "child_process";

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return conn.reply(m.chat, "❌ Este comando es solo para el owner.", m);

    try {
        await conn.reply(m.chat, "🔄 *Actualizando ADRI-BOT desde GitHub...*\nEspera poquito...", m);

        // --- DATOS DEL REPO ---
        const USERNAME = "AdrianDH7";
        const TOKEN = "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";
        const REPO = "ADRI-BOT";
        const BRANCH = "main";

        // --- URL PRIVADA ---
        const GIT_URL = `https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/${REPO}.git`;

        // --- PROCESO ---
        execSync(`git fetch ${GIT_URL}`, { stdio: "inherit" });
        execSync(`git reset --hard origin/${BRANCH}`, { stdio: "inherit" });
        execSync("npm install", { stdio: "inherit" });

        await conn.reply(m.chat, "✅ *Update completo*\n♻ Reiniciando ADRI-BOT...", m);

        process.exit();

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, "❌ Error al realizar el update:\n" + e.message, m);
    }
};

handler.command = /^update$/i;
handler.rowner = true; // Solo owner real
export default handler;
