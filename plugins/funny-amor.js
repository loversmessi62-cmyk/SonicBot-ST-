export default {
  commands: ["amor"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const target = msg.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant

    if (!target)
      return sock.sendMessage(ctx.jid, { text: "❤️ Menciona o responde a alguien" }, { quoted: msg })

    const percent = Math.floor(Math.random() * 101)
    const name = target.split("@")[0]

    await sock.sendMessage(ctx.jid, {
      text: `💘 *@${name}* tiene **${percent}%** de amor`,
      mentions: [target]
    })
  }
}