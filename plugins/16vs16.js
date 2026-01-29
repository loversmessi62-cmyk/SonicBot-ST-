import axios from "axios"

export const partidas16 = {}

export default {
  commands: ["16vs16", "vs16"],
  category: "freefire",
  group: true,
  admin: false,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid

    if (!args[0]) {
      return sock.sendMessage(jid, {
        text:
`❌ *Uso correcto:*
.16vs16 8mx
.16vs16 21mx`
      }, { quoted: msg })
    }

    const mx = parseInt(args[0].replace("mx", ""))
    if (isNaN(mx)) return

    const col = (mx + 1) % 24

    const encabezados = [
      "⚡ INVOCACIÓN DE BATALLA | 16x16",
      "🎖️ RETO MULTIESCUADRA ACTIVADO",
      "🔥 COMBATE TOTAL - CLAN VS CLAN"
    ]

    const imagenes = [
      "https://iili.io/FKVDVAN.jpg",
      "https://iili.io/FKVbUrJ.jpg",
      "https://iili.io/HZOHhlx.jpg"
    ]

    const titulo = encabezados[Math.floor(Math.random() * encabezados.length)]
    const img = imagenes[Math.floor(Math.random() * imagenes.length)]

    const thumbnail = Buffer.from(
      (await axios.get(img, { responseType: "arraybuffer" })).data
    )

    const izumi = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        orderMessage: {
          itemCount: 16,
          message: titulo,
          footerText: "SonicBot-ST",
          thumbnail,
          surface: 2,
          sellerJid: "0@s.whatsapp.net"
        }
      }
    }

    const texto = `
🔥 *16 VS 16 | SONICBOT-ST*

🕒 *HORARIOS*
🇲🇽 México: ${mx} MX
🇨🇴 Colombia: ${col} COL

━━━━━━━━━━━━━━━

🎮 *JUGADORES* (16)
1. —
2. —
3. —
4. —
5. —
6. —
7. —
8. —
9. —
10. —
11. —
12. —
13. —
14. —
15. —
16. —

🪑 *SUPLENTES*
1. —
2. —
3. —
4. —

━━━━━━━━━━━━━━━
Selecciona una opción:
`.trim()

    const sent = await sock.sendMessage(
      jid,
      {
        image: { url: "https://cdn.russellxz.click/16b3faeb.jpeg" },
        caption: texto,
        buttons: [
          {
            buttonId: ".jugador16",
            buttonText: { displayText: "🎮 Jugador" },
            type: 1
          },
          {
            buttonId: ".suplente16",
            buttonText: { displayText: "🪑 Suplente" },
            type: 1
          },
          {
            buttonId: ".quitar16",
            buttonText: { displayText: "❌ Quitar" },
            type: 1
          }
        ],
        headerType: 4
      },
      { quoted: izumi }
    )

    const uid = sent.key.id + jid

    partidas16[uid] = {
      jid,
      mx,
      col,
      jugadores: new Set(),
      suplentes: new Set()
    }
  }
}