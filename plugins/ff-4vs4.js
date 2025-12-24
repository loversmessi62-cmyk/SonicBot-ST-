import moment from "moment-timezone"

const lobbies = new Map()

export default {
  command: ["4vs4"],

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid

    // Hora base (ej: 2mx, 7pm, 14)
    const raw = args[0] || "8pm"

    // Detectar MX / CO / AR / PE
    const match = raw.match(/(\d+)(am|pm)?(mx|co|ar|pe)?/i)
    if (!match) {
      return sock.sendMessage(jid, { text: "❌ Formato inválido. Ej: `.4vs4 2pm mx`" }, { quoted: msg })
    }

    let hour = parseInt(match[1])
    const ampm = match[2]
    const zone = (match[3] || "mx").toLowerCase()

    if (ampm === "pm" && hour < 12) hour += 12
    if (ampm === "am" && hour === 12) hour = 0

    const zones = {
      mx: "America/Mexico_City",
      co: "America/Bogota",
      pe: "America/Lima",
      ar: "America/Argentina/Buenos_Aires"
    }

    const baseZone = zones[zone] || zones.mx

    const times = Object.entries(zones).map(([k, z]) => {
      const t = moment.tz({ hour }, baseZone).tz(z)
      return `🇨🇱 ${k.toUpperCase()}: ${t.format("hh:mm A")}`
    }).join("\n")

    const sent = await sock.sendMessage(jid, {
      text: `⚔️ *4 VS 4* ⚔️

🕒 *HORARIOS*
${times}

🎮 *JUGADORES (0/4):*
—

🪑 *SUPLENTES (0/2):*
—

❤️ = Jugador  
👍 = Suplente  
❌ = Salir`
    }, { quoted: msg })

    // Guardar lobby
    lobbies.set(sent.key.id, {
      chat: jid,
      hora: times,
      jugadores: [],
      suplentes: []
    })
  },

  async onMessage(sock, msg) {
    if (!msg.message?.reactionMessage) return

    const emoji = msg.message.reactionMessage.text
    const key = msg.message.reactionMessage.key.id
    const user = msg.key.participant || msg.key.remoteJid

    if (!lobbies.has(key)) return
    const lobby = lobbies.get(key)

    // Quitar de todos
    lobby.jugadores = lobby.jugadores.filter(u => u !== user)
    lobby.suplentes = lobby.suplentes.filter(u => u !== user)

    if (emoji === "❤️" && lobby.jugadores.length < 4) {
      lobby.jugadores.push(user)
    }

    if (emoji === "👍" && lobby.suplentes.length < 2) {
      lobby.suplentes.push(user)
    }

    const format = list =>
      list.length
        ? list.map((u, i) => `${i + 1}. @${u.split("@")[0]}`).join("\n")
        : "—"

    await sock.sendMessage(lobby.chat, {
      text: `⚔️ *4 VS 4* ⚔️

🕒 *HORARIOS*
${lobby.hora}

🎮 *JUGADORES (${lobby.jugadores.length}/4):*
${format(lobby.jugadores)}

🪑 *SUPLENTES (${lobby.suplentes.length}/2):*
${format(lobby.suplentes)}

❤️ = Jugador  
👍 = Suplente  
❌ = Salir`,
      mentions: [...lobby.jugadores, ...lobby.suplentes]
    })
  }
}