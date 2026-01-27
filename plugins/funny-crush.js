export default {
  commands: ["crush"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const target = msg.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant

    if (!target)
      return sock.sendMessage(ctx.jid, { text: "💘 Menciona o responde a alguien" }, { quoted: msg })

    const name = target.split("@")[0]

    await sock.sendMessage(ctx.jid, {
      text: `💘 *@${name}* anda sospechosamente enamorad@ 👀`,
      mentions: [target]
    })
  }
}