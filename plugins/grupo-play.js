import axios from "axios";
import yts from "yt-search";

export default {
  commands: ["play"],
  group: true,

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(jid, {
        text: "🎵 Usa: *.play nombre de la canción*"
      });
    }

    await sock.sendMessage(jid, {
      react: { text: "⏳", key: msg.key }
    });

    try {
      const search = await yts(text);
      const video = search.videos[0];
      if (!video) throw "No encontré resultados";

      const api = `https://api.lolhuman.xyz/api/ytaudio2?apikey=f8267e6585a96d8eb1cc371a&url=${video.url}`;
      const res = await axios.get(api);

      if (!res.data?.result?.link) throw "No se pudo obtener el audio";

      await sock.sendMessage(jid, {
        audio: { url: res.data.result.link },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
      }, { quoted: msg });

      await sock.sendMessage(jid, {
        react: { text: "✅", key: msg.key }
      });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(jid, {
        text: "❌ Error al reproducir la canción"
      });
    }
  }
};