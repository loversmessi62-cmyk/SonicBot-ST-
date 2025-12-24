const lobbies = new Map()

export default {
  command: ['4vs4'],

  async run(sock, msg, args) {
    const chat = msg.key.remoteJid
    const hora = args.join(' ') || 'Sin hora definida'

    const text = `⚔️ *4 VS 4* ⚔️
🕒 *Hora:* ${hora}

🎮 *JUGADORES (0/4):*
—

🪑 *SUPLENTES (0/2):*
—

❤️ = Jugador
👍 = Suplente
❌ = Salir`

    const sent = await sock.sendMessage(chat, { text }, { quoted: msg })

    lobbies.set(sent.key.id, {
      chat,
      hora,
      jugadores: [],
      suplentes: []
    })

    // Reacciones iniciales
    await sock.sendMessage(chat, {
      react: { text: '❤️', key: sent.key }
    })
    await sock.sendMessage(chat, {
      react: { text: '👍', key: sent.key }
    })
    await sock.sendMessage(chat, {
      react: { text: '❌', key: sent.key }
    })
  },

  // 👇 ESTO ES LO QUE TÚ PREGUNTABAS
  async onMessage(sock, msg) {
    if (!msg.message?.reactionMessage) return

    const emoji = msg.message.reactionMessage.text
    const key = msg.message.reactionMessage.key.id
    const user = msg.key.participant || msg.key.remoteJid

    if (!lobbies.has(key)) return

    const lobby = lobbies.get(key)

    // Quitar de todos antes
    lobby.jugadores = lobby.jugadores.filter(u => u !== user)
    lobby.suplentes = lobby.suplentes.filter(u => u !== user)

    if (emoji === '❤️' && lobby.jugadores.length < 4) {
      lobby.jugadores.push(user)
    }

    if (emoji === '👍' && lobby.suplentes.length < 2) {
      lobby.suplentes.push(user)
    }

    // ❌ solo sale (ya se removió arriba)

    const format = list =>
      list.length
        ? list.map((u, i) => `${i + 1}. @${u.split('@')[0]}`).join('\n')
        : '—'

    await sock.sendMessage(lobby.chat, {
      text: `⚔️ *4 VS 4* ⚔️
🕒 *Hora:* ${lobby.hora}

🎮 *JUGADORES (${lobby.jugadores.length}/4):*
${format(lobby.jugadores)}

🪑 *SUPLENTES (${lobby.suplentes.length}/2):*
${format(lobby.suplentes)}

❤️ = Jugador
👍 = Suplente
❌ = Salir`,
      mentions: [...lobby.jugadores, ...lobby.suplentes]
    })
  }
}