export const partidas16 = {}

let handler = async (m, { conn, args }) => {
  const jid = m.chat

  // ========= RESPUESTA A BOTONES =========
  if (m.message?.buttonsResponseMessage) {
    const btn = m.message.buttonsResponseMessage.selectedButtonId
    const data = partidas16[jid]
    if (!data) return

    const user = m.sender

    // Quitar
    if (btn === "16_quitar") {
      data.jugadores = data.jugadores.filter(u => u !== user)
      data.suplentes = data.suplentes.filter(u => u !== user)
    }

    // Jugador
    if (btn === "16_jugador") {
      if (yaEsta(user, data)) return
      if (data.jugadores.length < 16) data.jugadores.push(user)
    }

    // Suplente
    if (btn === "16_suplente") {
      if (yaEsta(user, data)) return
      if (data.suplentes.length < 4) data.suplentes.push(user)
    }

    return conn.sendMessage(jid, {
      text: render16(data),
      buttons: botones16(),
      headerType: 1,
      mentions: [...data.jugadores, ...data.suplentes]
    }, { edit: data.key })
  }

  // ========= COMANDO =========
  if (!args[0]) {
    return m.reply("❌ Uso:\n.16vs16 8mx")
  }

  const mx = parseInt(args[0].replace("mx", ""))
  if (isNaN(mx)) return

  const col = (mx + 1) % 24

  const sent = await conn.sendMessage(jid, {
    text: render16({
      mx,
      col,
      jugadores: [],
      suplentes: []
    }),
    buttons: botones16(),
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

handler.command = /^(16vs16)$/i
handler.group = true
export default handler

// ========= FUNCIONES =========

function botones16() {
  return [
    { buttonId: "16_jugador", buttonText: { displayText: "🎮 Jugador" }, type: 1 },
    { buttonId: "16_suplente", buttonText: { displayText: "🪑 Suplente" }, type: 1 },
    { buttonId: "16_quitar", buttonText: { displayText: "❌ Quitarme" }, type: 1 }
  ]
}

function yaEsta(user, d) {
  return d.jugadores.includes(user) || d.suplentes.includes(user)
}

function tag(u) {
  return u ? `@${u.split("@")[0]}` : "—"
}

function render16(d) {
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