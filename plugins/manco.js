const handler = {
  command: ['manco', 'manca'],
  tags: ['funny'],
  help: ['manco @usuario', 'manca nombre'],
  group: false,

  async run(sock, msg, args, ctx) {
    const text = args.join(' ')

    if (!text) {
      return sock.sendMessage(
        ctx.jid,
        { text: '⚡ Ingresa el @ o el nombre para calcular su nivel de MANCO' },
        { quoted: msg }
      )
    }

    // 0 – 700%
    const porcentaje = Math.floor(Math.random() * 701)

    let reaccion = '🤔'
    if (porcentaje <= 100) reaccion = '😂'
    else if (porcentaje <= 300) reaccion = '😅'
    else if (porcentaje <= 500) reaccion = '🔥'
    else if (porcentaje <= 650) reaccion = '🤯'
    else reaccion = '👑'

    const resultado = `
━━━━━━━✨━━━━━━━
📊 *Nivel MANCO*
👤 Persona: *${text}*
🎮 Resultado: *${porcentaje}% MANCO* ${reaccion}
━━━━━━━━━━━━━━━
`.trim()

    await sock.sendMessage(
      ctx.jid,
      { text: resultado },
      { quoted: msg }
    )
  }
}

export default handler