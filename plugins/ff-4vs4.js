export default {
  command: ['4vs4'],
  tags: ['ff'],
  help: ['4vs4 <hora mx>'],

  run: async (sock, msg, args) => {
    const jid = msg.key.remoteJid

    // Hora base MX
    let horaMX = args.join(' ') || 'Hora por definir'

    // Si ponen solo "2mx", "8pm mx", etc
    horaMX = horaMX.replace(/mx/i, 'MX')

    const texto = `
⚔️ *4 VS 4 FREE FIRE* ⚔️

🕒 *HORARIOS*
🇲🇽 México: ${horaMX}
🇨🇴 Colombia: +1h
🇵🇪 Perú: +1h
🇨🇱 Chile: +2h
🇦🇷 Argentina: +3h
🇧🇷 Brasil: +3h

━━━━━━━━━━━━━━

🎮 *JUGADORES*
1. —
2. —
3. —
4. —

🪑 *SUPLENTES*
1. —
2. —

📌 *Anótate escribiendo tu nombre*
🔥 *Modo serio*
`

    await sock.sendMessage(jid, { text: texto }, { quoted: msg })
  }
}