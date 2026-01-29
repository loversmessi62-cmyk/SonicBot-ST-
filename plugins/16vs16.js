export const partidas16 = {}

export default {
  command: ['16vs16'],
  group: true,
  admin: false,
  run: async (m, { conn, args }) => {
    const jid = m.chat
    args = args || []

    // ====== BOTONES ======
    if (m.message?.buttonsResponseMessage) {
      const id = m.message.buttonsResponseMessage.selectedButtonId
      const data = partidas16[jid]
      if (!data) return

      const user = m.sender

      if (id === "jugador") {
        if (!esta(user, data) && data.jugadores.length < 16)
          data.jugadores.push(user)
      }

      if (id === "suplente") {
        if (!esta(user, data) && data.suplentes.length < 4)
          data.suplentes.push(user)
      }

      if (id === "quitar") {
        data.jugadores = data.jugadores.filter(u => u !== user)
        data.suplentes = data.suplentes.filter(u => u !== user)
      }

      return conn.sendMessage(jid, {
        text: render(data),
        buttons: botones(),
        headerType: 1,
        mentions: [...data.jugadores, ...data.suplentes]
      }, { edit: data.key })
    }

    // ====== COMANDO ======
    const mxArg = args[0]
    if (!mxArg) return m.reply("❌ Uso correcto: .16vs16 8mx")

    const mx = parseInt(mxArg.replace("mx", ""))
    if (isNaN(mx)) return m.reply("❌ Hora inválida")

    const col = (mx + 1) % 24

    const sent = await conn.sendMessage(jid, {
      text: render({
        mx,
        col,
        jugadores: [],
        suplentes: []
      }),
      buttons: botones(),
      headerType: 1
    }, { quoted: m })

    partidas16[jid] = {
      mx,
      col,
      jugadores: [],
      suplentes: [],
      key: sent.key
    }
  }
}

// ====== HELPERS ======

function botones() {
  return [
    { buttonId: "jugador", buttonText: { displayText: "🎮 Jugador" }, type: 1 },
    { buttonId: "suplente", buttonText: { displayText: "🪑 Suplente" }, type: 1 },
    { buttonId: "quitar", buttonText: { displayText: "❌ Quitarme" }, type: 1 }
  ]
}

function esta(u, d) {
  return d.jugadores.includes(u) || d.suplentes.includes(u)
}

function tag(u) {
  return u ? `@${u.split("@")[0]}` : "—"
}

function render(d) {
  return `
🔥 *16 VS 16 | SONICBOT-ST*

🕒 *HORARIOS*
🇲🇽 México: ${d.mx} MX
🇨🇴 Colombia: ${d.col} COL

━━━━━━━━━━━━━━━

🎮 *JUGADORES* (16)
${Array.from({ length: 16 }, (_, i) => `${i + 1}. ${tag(d.jugadores[i])}`).join("\n")}

🪑 *SUPLENTES*
${Array.from({ length: 4 }, (_, i) => `${i + 1}. ${tag(d.suplentes[i])}`).join("\n")}

━━━━━━━━━━━━━━━
Selecciona una opción:
`.trim()
}