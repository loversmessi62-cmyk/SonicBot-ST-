import { store } from "../index.js";

export default {
    commands: ["fantasmas", "inactivos"],
    category: "grupos",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;

        const metadata = await sock.groupMetadata(jid);
        const participantes = metadata.participants.map(p => p.id);

        await store.loadMessages(jid, 200);

        const msgs = store.messages[jid] || {};

        const inactivos = participantes.filter(p => !msgs[p]);

        let texto = "👻 *MIEMBROS INACTIVOS*\n\n";

        if (inactivos.length === 0) {
            texto += "✨ No hay fantasmas en este grupo";
        } else {
            for (let u of inactivos) {
                texto += `• @${u.split("@")[0]}\n`;
            }
        }

        await sock.sendMessage(jid, {
            text: texto,
            mentions: inactivos
        }, { quoted: msg });
    }
};
