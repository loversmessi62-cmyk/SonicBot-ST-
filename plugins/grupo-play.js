import axios from "axios";

export default {
  command: ["play"],
  tags: ["music"],
  desc: "Reproduce música por nombre",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const query = args.join(" ").trim();

    if (!query) {
      return sock.sendMessage(jid, {
        text: "🎵 Usa: *.play nombre de la canción*"
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: "🔎 Buscando música..."
      }, { quoted: msg });

      const apiKey = "f8267e6585a96d8eb1cc371a";

      const res = await axios.get(
        `https://api.lolhuman.xyz/api/ytplay2?apikey=${apiKey}&query=${encodeURIComponent(query)}`
      );

      const data = res.data.result;

      await sock.sendMessage(jid, {
        audio: { url: data.audio },
        mimetype: "audio/mpeg",
        fileName: `${data.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: data.title,
            body: data.author,
            thumbnailUrl: data.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ ERROR PLAY:", e);
      await sock.sendMessage(jid, {
        text: "❌ Error al reproducir la canción."
      }, { quoted: msg });
    }
  }
};