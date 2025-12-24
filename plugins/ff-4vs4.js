let partidas = new Map()

let handler = async (m, { conn }) => {
  const chat = m.chat

  if (partidas.has(chat)) {
    return m.reply('⚠️ Ya hay una partida activa aquí')
  }

  const data = {
    players: [],
    subs: [],
    msgId: null
  }

  let texto = generarTexto(data)
  let msg = await conn.sendMessage(chat, { text: texto })

  data.msgId = msg.key.id
  partidas.set(chat, data)

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

handler.before = async (m, { conn }) => {
  if (!m.message?.reactionMessage) return

  const chat = m.chat
  const game = partidas.get(chat)
  if (!game) return

  const { key, text } = m.message.reactionMessage
  if (key.id !== game.msgId) return

  const user = m.sender

  // salir
  if (text === '❌') {
    game.players = game.players.filter(u => u !== user)
    game.subs = game.subs.filter(u => u !== user)
  }

  // jugador
  if (text === '❤️') {
    if (!game.players.includes(user) && game.players.length < 4) {
      game.players.push(user)
      game.subs = game.subs.filter(u => u !== user)
    }
  }

  // suplente
  if (text === '👍') {
    if (!game.subs.includes(user) && game.subs.length < 2) {
      game.subs.push(user)
      game.players = game.players.filter(u => u !== user)
    }
  }

  let nuevoTexto = generarTexto(game)

  await conn.sendMessage(chat, {
    text: nuevoTexto,
    edit: {
      remoteJid: chat,
      id: game.msgId
    }
  })
}

handler.command = /^4vs4$/i
handler.tags = ['juegos']
handler.help = ['4vs4']

export default handler

function generarTexto(data) {
  let t = `⚔️ *4 VS 4*\n\n`

  t += `👥 *Jugadores*\n`
  for (let i = 0; i < 4; i++) {
    let u = data.players[i]
    t += `${i + 1}. ${u ? '@' + u.split('@')[0] : '—'}\n`
  }

  t += `\n🪑 *Suplentes*\n`
  for (let i = 0; i < 2; i++) {
    let u = data.subs[i]
    t += `${i + 1}. ${u ? '@' + u.split('@')[0] : '—'}\n`
  }

  t += `\n❤️ = jugador`
  t += `\n👍 = suplente`
  t += `\n❌ = salir`

  return t
}