import axios from "axios"

export default {
  commands: ["vs16", "16vs16"],
  category: "freefire",
  group: true,
  admin: false,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid

    if (!args[0]) {
      return sock.sendMessage(jid, {
        text: `
╭─❍ *🔥 RETO 16 VS 16 | SONICBOT-ST*
│
│⏳ *Horario:*
│🇲🇽 MÉXICO:
│🇨🇴 COLOMBIA:
│
│🎮 *Modalidad:*
│👥 *Jugadores:*
│
│🏆 *Escuadra 1:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🏆 *Escuadra 2:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🏆 *Escuadra 3:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🏆 *Escuadra 4:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🔄 *Suplentes:*
│ 🥷🏻 •
│ 🥷🏻 •
╰────────────────────❍
`
      })
    }

    // ===== Mensaje citado tipo "Izumi"
    const headers = [
      "⚡ INVOCACIÓN DE BATALLA | 16x16",
      "🔥 COMBATE TOTAL - CLAN VS CLAN",
      "🎖️ RETO MULTIESCUADRA ACTIVADO"
    ]

    const images = [
      "https://iili.io/FKVDVAN.jpg",
      "https://iili.io/FKVbUrJ.jpg",
      "https://iili.io/HZOHhlx.jpg"
    ]

    const title = headers[Math.floor(Math.random() * headers.length)]
    const img = images[Math.floor(Math.random() * images.length)]

    const thumb = Buffer.from(
      (await axios.get(img, { responseType: "arraybuffer" })).data
    )

    const quoted = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        orderMessage: {
          itemCount: 16,
          message: title,
          footerText: "SonicBot-ST",
          thumbnail: thumb,
          surface: 2,
          sellerJid: "0@s.whatsapp.net"
        }
      }
    }

    // ===== BOTONES
    const buttons = [
      {
        buttonId: ".jugador",
        buttonText: { displayText: "👤 Jugador" },
        type: 1
      },
      {
        buttonId: ".suplente",
        buttonText: { displayText: "🔄 Suplente" },
        type: 1
      },
      {
        buttonId: ".quitar",
        buttonText: { displayText: "❌ Quitar" },
        type: 1
      }
    ]

    const caption = `
╭─❍ *🔥 16 VS 16 | SONICBOT-ST*
│
│⏳ *Horario:*
│🇲🇽 MÉXICO: ${args[0]}
│🇨🇴 COLOMBIA: ${args[0]}
│
│🎮 *Modalidad:*
│👥 *Jugadores:*
│
│🏆 *Escuadra 1:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🏆 *Escuadra 2:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🏆 *Escuadra 3:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🏆 *Escuadra 4:*
│ 👑 •
│ 🥷🏻 •
│ 🥷🏻 •
│ 🥷🏻 •
│
│🔄 *Suplentes:*
│ 🥷🏻 •
│ 🥷🏻 •
╰────────────────────❍
`

    await sock.sendMessage(
      jid,
      {
        image: { url: "https://cdn.russellxz.click/16b3faeb.jpeg" },
        caption,
        buttons,
        headerType: 4
      },
      { quoted }
    )
  }
}