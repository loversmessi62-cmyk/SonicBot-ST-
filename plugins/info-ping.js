export default {
  commands: ["ping"],
  category: "info",

  async run(sock, msg, args, ctx) {
    const start = Date.now()

    const sent = await sock.sendMessage(ctx.jid, { text: "⚡ Midiendo velocidad..." })

    const end = Date.now()
    const ms = end - start

    await sock.sendMessage(ctx.jid, {
      text: `⚡ *PONG*\nVelocidad: *${ms} ms*`
    }, { quoted: sent })
  }
}