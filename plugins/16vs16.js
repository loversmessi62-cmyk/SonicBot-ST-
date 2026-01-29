export const partidas16 = {}

export default {
  commands: ["16vs16"],
  category: "freefire",
  group: true,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid
    const horaMX = args[0]

    if (!horaMX) {
      return sock.sendMessage(jid, {
        text: "❌ Uso correcto:\n.16vs16 8mx"
      }, { quoted: msg })
    }

    const mx = parseInt(horaMX.replace("mx", ""))
    if (isNaN(mx)) return
    const col = (mx + 1) % 24

    const sent = await sock.sendMessage(jid, {
      text: generarTexto(mx, col),
      buttons: botones(),
      headerType: 1
    }, { quoted: msg })

    partidas16[jid] = {
      mx,
      col,
      msgKey: sent.key,
      jugadores: [],
      suplentes: []
    }
  },

  async before(sock, msg, ctx) {
    if (!msg.message?.buttonsResponseMessage) return

    const jid = ctx.jid
    const data = partidas16[jid]
    if (!data) return

    const user = msg.sender
    const btn = msg.message.buttonsResponseMessage.selectedButtonId

    // Quitar
    if (btn === "quitar16") {
      let i = data.jugadores.indexOf(user)
      if (i !== -1) data.jugadores.splice(i, 1)

      let s = data.suplentes.indexOf(user)
      if (s !== -1) data.suplentes.splice(s, 1)
    }

    // Jugador
    if (btn === "jugador16") {
      if (esta(user, data)) return
      if (data.jugadores.length < 16) {
        data.jugadores.push(user)
      }
    }

    // Suplente
    if (btn === "suplente16") {
      if (esta(user, data)) return
      if (data.suplentes.length < 4) {
        data.suplentes.push(user)
      }
    }

    await sock.sendMessage(jid, {
      text: generarTexto(data.mx, data.col, data),
      buttons: botones(),
      headerType: 1
    }, { edit: data.msgKey })
  }
}

/* ============== FUNCIONES ============== */

function botones() {
  return [
    { buttonId: "jugador16", buttonText: { displayText: "🎮 Jugador" }, type: 1 },
    { buttonId: "suplente16", buttonText: { displayText: "🪑 Suplente" }, type: 1 },
    { buttonId: "quitar16", buttonText: { displayText: "❌ Quitarme" }, type: 1 }
  ]
}

function esta(user, data) {
  return data.jugadores.includes(user) || data.suplentes.includes(user)
}

function tag(jid) {
  return jid ? `@${jid.split("@")[0]}` : "—"
}

function generarTexto(mx, col, data = null) {
  const j = data?.jugadores || []
  const s = data?.suplentes || []

  return `
🔥 *16 VS 16 | SONICBOT-ST*

🕒 *HORARIOS*
🇲🇽 México: ${mx} MX
🇨🇴 Colombia: ${col} COL

━━━━━━━━━━━━━━━

🎮 *JUGADORES* (16)
${Array.from({ length: 16 }, (_, i) => `${i + 1}. ${tag(j[i])}`).join("\n")}

🪑 *SUPLENTES*
${Array.from({ length: 4 }, (_, i) => `${i + 1}. ${tag(s[i])}`).join("\n")}

━━━━━━━━━━━━━━━
Selecciona una opción:
`.trim()
}