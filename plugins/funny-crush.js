export default {
  commands: ["crush"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const target =
      msg.mentionedJid?.[0] ||
      msg.quoted?.sender

    if (!target)
      return sock.sendMessage(ctx.jid, { text: "💘 Menciona o responde a alguien" })

    const name = target.split("@")[0]

    await sock.sendMessage(ctx.jid, {
      text: `💘 *@${name}*… alguien aquí anda bien enamorado 👀`,
      mentions: [target]
    })
  }
}