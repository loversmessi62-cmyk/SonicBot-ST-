let handler = async (m, { conn, command, text }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `⚡ Ingresa el @ o el nombre de la persona para calcular su porcentaje de *${command.toUpperCase()}*`,
      m
    )

  // Porcentaje 0–700
  let porcentaje = Math.floor(Math.random() * 701)

  let reaccion = '🤔'
  if (porcentaje <= 100) reaccion = '😂'
  else if (porcentaje <= 300) reaccion = '😅'
  else if (porcentaje <= 500) reaccion = '🔥'
  else if (porcentaje <= 650) reaccion = '🤯'
  else reaccion = '👑'

  let msg = `
━━━━━━━✨━━━━━━━
📊 Cálculo de *${command.toUpperCase()}*
👤 Persona: *${text}*
🔮 Resultado: *${porcentaje}% ${command.toUpperCase()}* ${reaccion}
━━━━━━━━━━━━━━━
`.trim()

  await conn.reply(m.chat, msg, m)
}

handler.help = ['manco @tag', 'manca nombre']
handler.tags = ['funny']
handler.command = ['manco', 'manca']

export default handler