export default {
  commands: ["tonto"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const target = (() => {
      if (msg.mentionedJid?.length) return msg.mentionedJid[0]
      const c = msg.message?.extendedTextMessage?.contextInfo
      return c?.participant || null
    })()

    if (!target)
      return sock.sendMessage(ctx.jid, { text: "🤡 Menciona o responde a alguien" }, { quoted: msg })

    const name = target.split("@")[0]

    await sock.sendMessage(ctx.jid, {
      text: `😵‍💫 *@${name}* tiene más lag que WiFi del OXXO`,
      mentions: [target]
    })
  }
}