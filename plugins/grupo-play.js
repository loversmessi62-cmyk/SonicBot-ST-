import axios from "axios";

export default {
    commands: ["play"],
    category: "music",

    async run(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const query = args.join(" ").trim();

        if (!query) {
            return sock.sendMessage(jid, {
                text: "🎵 Usa: *.play nombre de la canción*"
            }, { quoted: msg });
        }

        try {
            const { data } = await axios.get(
                "https://ytsearcher.vercel.app/search?q=" + encodeURIComponent(query)
            );

            if (!data?.videos?.length) {
                return sock.sendMessage(jid, {
                    text: "❌ No encontré resultados."
                }, { quoted: msg });
            }

            const v = data.videos[0];

            const text = `
🎶 *RESULTADO*

📌 *Título:* ${v.title}
👤 *Canal:* ${v.author}
⏱ *Duración:* ${v.duration}
👁 *Vistas:* ${v.views}
🔗 *Link:* ${v.url}
            `.trim();

            await sock.sendMessage(jid, {
                image: { url: v.thumbnail },
                caption: text
            }, { quoted: msg });

        } catch (e) {
            console.error("PLAY ERROR:", e);
            await sock.sendMessage(jid, {
                text: "❌ Error buscando la canción."
            }, { quoted: msg });
        }
    }
};
