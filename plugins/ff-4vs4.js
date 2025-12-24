import { lobbies } from '../lib/4vs4.js'

export default {
  command: ['4vs4'],
  run: async (sock, m, args) => {
    const chat = m.key.remoteJid
    const horaArg = args[0] || '2mx'

    const horas = calcularHoras(horaArg)

    const msg = await sock.sendMessage(chat, {
      text: `⚔️ *4 VS 4* ⚔️

🕒 *Horarios*
🇲🇽 MX: ${horas.mx}
🇨🇴 CO: ${horas.co}
🇦🇷 AR: ${horas.ar}
🇵🇪 PE: ${horas.pe}

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
      hora: horaArg,
      jugadores: [],
      suplentes: []
    })
  }
}

// =========================
// HORAS POR PAÍS
// =========================
function calcularHoras(input) {
  const base = parseInt(input)
  return {
    mx: `${base}:00`,
    co: `${(base + 1) % 24}:00`,
    pe: `${(base + 1) % 24}:00`,
    ar: `${(base + 3) % 24}:00`
  }
}