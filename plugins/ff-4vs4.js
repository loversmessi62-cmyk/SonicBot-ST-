const salas4vs4 = new Map()

let handler = async (m, { conn, text }) => {
  const chat = m.chat

  if (salas4vs4.has(chat)) {
    return m.reply('⚠️ Ya hay una sala 4vs4 activa en este chat')
  }

  const hora = text?.trim() || 'Hora no definida'

  const data = {
    jugadores: [],
    suplentes: [],
    msgId: null
  }

  let mensaje = `
🎮 *4 VS 4 ABIERTA*
⏰ *Hora:* ${hora}

👥 *Jugadores (0/4)*

🔁 *Suplentes (0/2)*

_Reacciona:_
❤️ Entrar jugador  
👍 Entrar suplente  
❌ Salir
  `.trim()

  const sent = await conn.sendMessage(chat, { text: mensaje })
  data.msgId = sent.key.id
  salas4vs4.set(chat, data)

  await conn.sendMessage(chat, { react: { text: '❤️', key: sent.key } })
  await conn.sendMessage(chat, { react: { text: '👍', key: sent.key } })
  await conn.sendMessage(chat, { react: { text: '❌', key: sent.key } })
}

handler.before = async (m, { conn }) => {
  if (!m.message?.reactionMessage) return

  const chat = m.chat
  const sala = salas4vs4.get(chat)
  if (!sala) return

  const react = m.message.reactionMessage.text
  const user = m.message.reactionMessage.key.participant || m.participant

  // quitar de todos
  sala.jugadores = sala.jugadores.filter(u => u !== user)
  sala.suplentes = sala.suplentes.filter(u => u !== user)

  if (react === '❤️') {
    if (sala.jugadores.length < 4) sala.jugadores.push(user)
  }

  if (react === '👍') {
    if (sala.suplentes.length < 2) sala.suplentes.push(user)
  }

  if (react === '❌') {
    // ya fue eliminado arriba
  }

  const texto = `
🎮 *4 VS 4 ABIERTA*

👥 *Jugadores (${sala.jugadores.length}/4)*
${sala.jugadores.map((u, i) => `${i + 1}. @${u.split('@')[0]}`).join('\n') || '-'}

🔁 *Suplentes (${sala.suplentes.length}/2)*
${sala.suplentes.map((u, i) => `${i + 1}. @${u.split('@')[0]}`).join('\n') || '-'}

_Reacciona para entrar o salir_
  `.trim()

  await conn.sendMessage(chat, {
    text: texto,
    mentions: [...sala.jugadores, ...sala.suplentes]
  }, { quoted: m })
}

handler.help = ['4vs4 [hora]']
handler.tags = ['game']
handler.command = /^4vs4$/i

export default handler