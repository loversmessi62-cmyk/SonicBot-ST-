import { totalmem, freemem } from 'os'
import { sizeFormatter } from 'human-readable'
import speed from 'performance-now'

const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`
})

function clockString(ms) {
  if (isNaN(ms)) return '--:--:--'
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

export default {
  commands: ['speed', 'ping'],
  category: 'info',
  run: async (sock, msg, args, ctx) => {
    try {
      const jid = msg.key.remoteJid
      const botName = global.namebot || sock.user?.name || 'Bot'

      // start timer
      const t0 = speed()

      // uptime
      const _muptime = process.uptime() * 1000
      const muptime = clockString(_muptime)

      // chats / groups: prefer ctx.store (compatible with your handler), fallback to sock.chats
      const storeChats = ctx?.store?.chats || sock.chats || {}
      const chatIds = Object.keys(storeChats)
      const privateChats = chatIds.filter(id => !id.endsWith('@g.us')).length
      const groups = chatIds.filter(id => id.endsWith('@g.us')).length

      // memory
      const usedRam = totalmem() - freemem()
      const totalRam = totalmem()

      // latency measured
      const latency = (speed() - t0).toFixed(4)

      const texto = `🚩 *${botName}*
🚀 *Velocidad:*
→ ${latency}

🕒 *Activo Durante:*
→ ${muptime}

💫 *Chats:*
→ ${privateChats} *Chats privados*
→ ${groups} *Grupos*

🏆 *Servidor:*
➤ *Ram ⪼* ${format(usedRam)} / ${format(totalRam)}`.trim()

      // send reply
      await sock.sendMessage(jid, { text: texto })
    } catch (err) {
      console.error('Error en plugin speed:', err)
      const jid = msg?.key?.remoteJid
      if (jid) await sock.sendMessage(jid, { text: `❌ Error:\n${err.message}` })
    }
  }
}