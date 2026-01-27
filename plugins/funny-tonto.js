export default {
  commands: ["tonto"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid

    const target =
      msg.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant

    if (!target) {
      return sock.sendMessage(jid, {
        text: "⚠️ Menciona o responde a alguien."
      }, { quoted: msg })
    }

    const name = target.split("@")[0]

    const frases = [
      `🤡 *@${name}* tiene más lag que WiFi del OXXO`,
      `🧠 *@${name}* cerebro en mantenimiento`,
      `😂 *@${name}* intenta, pero no lo logra`
    ]

    const r = frases[Math.floor(Math.random() * frases.length)]

    await sock.sendMessage(jid, {
      text: r,
      mentions: [target]
    })
  }
}