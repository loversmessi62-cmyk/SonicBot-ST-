import moment from "moment-timezone"
import { lobbies } from "../handler.js"

export default {
  command: ["4vs4"],

  async run(sock, msg, args) {
    const chat = msg.key.remoteJid

    // hora base MX
    let horaMX = args[0] || "2pm"
    let mx = moment.tz(horaMX, "hA", "America/Mexico_City")

    const horas = `
🇲🇽 MX: ${mx.format("hh:mm A")}
🇨🇴 COL: ${mx.clone().tz("America/Bogota").format("hh:mm A")}
🇵🇪 PE: ${mx.clone().tz("America/Lima").format("hh:mm A")}
🇦🇷 AR: ${mx.clone().tz("America/Argentina/Buenos_Aires").format("hh:mm A")}
🇨🇱 CL: ${mx.clone().tz("America/Santiago").format("hh:mm A")}
`

    const sent = await sock.sendMessage(chat, {
      text: `⚔️ *4 VS 4* ⚔️

🕒 *HORARIOS*
${horas}

🎮 *JUGADORES (0/4):*
—

🪑 *SUPLENTES (0/2):*
—

❤️ = Jugador
👍 = Suplente
❌ = Salir`
    })

    // GUARDAR LOBBY CON EL ID DEL MENSAJE
    lobbies.set(sent.key.id, {
      chat,
      msgId: sent.key.id,
      jugadores: [],
      suplentes: [],
      horas
    })
  },

  // 🔥 AQUÍ SE MANEJAN LAS REACCIONES
  async onMessage(sock, msg) {
    if (!msg.message?.reactionMessage) return

    const emoji = msg.message.reactionMessage.text
    const targetId = msg.message.reactionMessage.key.id
    const user = msg.key.participant || msg.key.remoteJid

    if (!lobbies.has(targetId)) return

    const lobby = lobbies.get(targetId)

    // quitar de todo
    lobby.jugadores = lobby.jugadores.filter(u => u !== user)
    lobby.suplentes = lobby.suplentes.filter(u => u !== user)

    if (emoji === "❤️" && lobby.jugadores.length < 4) {
      lobby.jugadores.push(user)
    }

    if (emoji === "👍" && lobby.suplentes.length < 2) {
      lobby.suplentes.push(user)
    }

    if (emoji === "❌") {
      // ya fue removido arriba
    }

    const format = list =>
      list.length
        ? list.map((u, i) => `${i + 1}. @${u.split("@")[0]}`).join("\n")
        : "—"

    await sock.sendMessage(lobby.chat, {
      text: `⚔️ *4 VS 4* ⚔️

🕒 *HORARIOS*
${lobby.horas}

🎮 *JUGADORES (${lobby.jugadores.length}/4):*
${format(lobby.jugadores)}

🪑 *SUPLENTES (${lobby.suplentes.length}/2):*
${format(lobby.suplentes)}

❤️ = Jugador
👍 = Suplente
❌ = Salir`,
      mentions: [...lobby.jugadores, ...lobby.suplentes],
      edit: lobby.msgId
    })
  }
}