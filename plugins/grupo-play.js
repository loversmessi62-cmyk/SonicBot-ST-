import axios from "axios"

export default {
  commands: ["play"],
  async run(sock, msg, args) {
    const text = args.join(" ")
    if (!text) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "🎵 Usa: *.play nombre de la canción*"
      }, { quoted: msg })
    }

    await sock.sendMessage(msg.key.remoteJid, {
      text: "🔎 Buscando música..."
    }, { quoted: msg })

    try {
      const res = await axios.get(
        "https://api.lolhuman.xyz/api/ytplay2",
        {
          params: {
            query: text,
            apikey: "f8267e6585a96d8eb1cc371a"
          }
        }
      )

      const data = res.data.result

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          audio: { url: data.audio },
          mimetype: "audio/mpeg",
          fileName: `${data.title}.mp3`
        },
        { quoted: msg }
      )

    } catch (e) {
      console.error(e)
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ No pude descargar la música."
      }, { quoted: msg })
    }
  }
}