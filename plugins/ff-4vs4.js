const lobbies = new Map()

let handler = async (m, { conn, text }) => {
  const chat = m.chat

  // Parsear hora
  let hora = 'No definida'
  if (text) {
    const match = text.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)?\s?(mx|co|ar|cl|pe)?/i)
    if (match) {
      let h = match[1]
      let min = match[2] || '00'
      let ampm = match[3]?.toUpperCase() || ''
      let tz = (match[4] || 'MX').toUpperCase()
      hora = `${h}:${min} ${ampm} (${tz})`
    }
  }

  const msg = await conn.sendMessage(chat, {
    text: `⚔️ *4 VS 4* ⚔️
🕒 *Hora:* ${hora}

🎮 *JUGADORES (0/4):*
—

🪑 *SUPLENTES (0/2):*
—

❤️ = Jugador
👍 = Suplente
❌ = Salir`
  })

  lobbies.set(msg.key.id, {
    chat,
    jugadores: [],
    suplentes: [],
    hora
  })

  await conn.sendMessage(chat, {
    react: { text: '❤️', key: msg.key }
  })
  await conn.sendMessage(chat, {
    react: { text: '👍', key: msg.key }
  })
  await conn.sendMessage(chat, {
    react: { text: '❌', key: msg.key }
  })
}

handler.command = /^4vs4$/i
handler.tags = ['games']
handler.help = ['4vs4 [hora]']

export default handler