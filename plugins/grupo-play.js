import axios from "axios";

export default {
  commands: ["play"],
  group: false,

  async run(sock, msg, args) {
    if (!args.length) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "🎵 Usa: *.play <nombre de la canción>*"
      }, { quoted: msg });
    }

    const query = args.join(" ");
    const apikey = "f8267e6585a96d8eb1cc371a";

    try {
      // 1️⃣ Buscar canción
      const search = await axios.get(
        "https://api.lolhuman.xyz/api/search/yt",
        {
          params: {
            apikey,
            query
          }
        }
      );

      if (!search.data.result?.length) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "❌ No encontré resultados."
        }, { quoted: msg });
      }

      const video = search.data.result[0];

      // 2️⃣ Obtener audio
      const audio = await axios.get(
        "https://api.lolhuman.xyz/api/ytmp3",
        {
          params: {
            apikey,
            url: video.link
          }
        }
      );

      const audioUrl = audio.data.result.link;

      // 3️⃣ Enviar audio
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`
        },
        { quoted: msg }
      );

    } catch (e) {
      console.error("❌ ERROR PLAY:", e);
      sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error al reproducir la canción."
      }, { quoted: msg });
    }
  }
};