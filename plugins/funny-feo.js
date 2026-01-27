export default {
  commands: ["feo"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const target = msg.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant

    if (!target)
      return sock.sendMessage(ctx.jid, { text: "🪞 Menciona o responde a alguien" }, { quoted: msg })

    const name = target.split("@")[0]

    await sock.sendMessage(ctx.jid, {
      text: `🪞 *@${name}*, el espejo pidió vacaciones`,
      mentions: [target]
    })
  }
}