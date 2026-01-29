const handler = {
  command: ['manco', 'manca'],
  tags: ['funny'],
  help: ['manco @usuario', 'manco (responder mensaje)'],
  group: false,

  async run(sock, msg, args, ctx) {
    let who
    let name

    // ===============================
    // DETERMINAR USUARIO
    // ===============================
    const mentioned =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid

    if (mentioned?.length) {
      who = mentioned[0]
    } else if (msg.quoted?.sender) {
      who = msg.quoted.sender
    } else {
      return sock.sendMessage(
        ctx.jid,
        { text: '⚠️ Menciona a alguien o responde a un mensaje.' },
        { quoted: msg }
      )
    }

    // ===============================
    // OBTENER NOMBRE
    // ===============================
    try {
      name = await sock.getName(who)
    } catch {
      name = who.split('@')[0]
    }

    // ===============================
    // PORCENTAJE
    // ===============================
    const porcentaje = Math.floor(Math.random() * 701)

    let reaccion = '🤔'
    if (porcentaje <= 100) reaccion = '😂'
    else if (porcentaje <= 300) reaccion = '😅'
    else if (porcentaje <= 500) reaccion = '🔥'
    else if (porcentaje <= 650) reaccion = '🤯'
    else reaccion = '👑'

    const numero = who.split('@')[0]

    const texto = `
━━━━━━━✨━━━━━━━
📊 *Nivel MANCO*
👤 Persona: @${numero}
🎮 Resultado: *${porcentaje}% MANCO* ${reaccion}
━━━━━━━━━━━━━━━
`.trim()

    // ===============================
    // ENVIAR MENSAJE
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        text: texto,
        mentions: [who]
      },
      { quoted: msg }
    )
  }
}

export default handler