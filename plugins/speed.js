import { totalmem, freemem } from 'os'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B','KB','MB','GB','TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(2).replace(/\.00$/, '')} ${sizes[i]}`
}

function clockString(ms) {
  if (isNaN(ms)) return '--:--:--'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

export default {
  commands: ['speed', 'ping'],
  category: 'info',
  run: async (sock, msg, args, ctx) => {
    try {
      const jid = ctx?.jid || msg?.key?.remoteJid
      if (!jid) return

      const botName = global.namebot || (sock?.user?.name) || 'Bot'

      // high-resolution timer start
      const t0 = process.hrtime.bigint()

      // uptime from process (ms)
      const upMs = process.uptime() * 1000
      const muptime = clockString(upMs)

      // chats counts: use ctx.store when available (handler passes store)
      const storeChats = ctx?.store?.chats || {}
      const chatIds = Object.keys(storeChats)
      const privateChats = chatIds.filter(id => !id.endsWith('@g.us')).length
      const groups = chatIds.filter(id => id.endsWith('@g.us')).length

      // memory from OS
      const usedRam = totalmem() - freemem()
      const totalRam = totalmem()

      // latency measured in ms
      const latencyMs = Number(process.hrtime.bigint() - t0) / 1e6

      const texto = `🚩 *${botName}*
🚀 *Velocidad:*
→ ${latencyMs.toFixed(4)} ms

🕒 *Activo Durante:*
→ ${muptime}

💫 *Chats:*
→ ${privateChats} *Chats privados*
→ ${groups} *Grupos*

🏆 *Servidor:*
➤ *Ram ⪼* ${formatBytes(usedRam)} / ${formatBytes(totalRam)}`.trim()

      // envía respuesta citando el mensaje (compatible con tu handler)
      await sock.sendMessage(jid, { text: texto }, { quoted: msg })
    } catch (err) {
      console.error('Error en plugin speed:', err)
      const jid = ctx?.jid || msg?.key?.remoteJid
      if (jid) await sock.sendMessage(jid, { text: `❌ Error:\n${err.message}` }, { quoted: msg })
    }
  }
}