import axios from "axios";

export default {
  commands: ["play"],
  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(jid, { text: "❌ Escribe el nombre de la canción." });
    }

    await sock.sendMessage(jid, { text: `🔎 Buscando: ${query}` });

    // 1️⃣ Buscar video en Invidious (JSON)
    const search = await axios.get(
      `https://yewtu.be/api/v1/search?q=${encodeURIComponent(query)}&type=video`
    );

    if (!search.data.length) {
      return sock.sendMessage(jid, { text: "❌ No se encontró nada." });
    }

    const video = search.data[0];
    const videoId = video.videoId;

    // 2️⃣ Audio directo
    const audioUrl = `https://yewtu.be/latest_version?id=${videoId}&itag=140`;

    // 3️⃣ Enviar audio
    await sock.sendMessage(jid, {
      audio: { url: audioUrl },
      mimetype: "audio/mp4",
      fileName: `${video.title}.m4a`
    });
  }
};