import axios from "axios";

export default {
  commands: ["play"],
  group: true,

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return sock.sendMessage(jid, {
        text: "🎵 Usa: *.play nombre de la canción*"
      });
    }

    await sock.sendMessage(jid, {
      text: "🔎 Buscando música..."
    });

    try {
      // API que SOLO devuelve URL (no descarga)
      const api = `https://api.neoxr.eu/api/play?query=${encodeURIComponent(text)}&apikey=russellxz`;
      const res = await axios.get(api);
      const data = res.data;

      if (!data.status) throw "No se pudo obtener el audio";

      const audioUrl = data.data.url;
      const title = data.data.title;

      await sock.sendMessage(jid, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(jid, {
        text: "❌ Error al reproducir la canción."
      });
    }
  }
};