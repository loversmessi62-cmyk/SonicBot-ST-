export default {
  commands: ["ship"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    if (args.length < 2)
      return sock.sendMessage(ctx.jid, { text: "💞 Uso: .ship nombre1 nombre2" })

    const percent = Math.floor(Math.random() * 101)

    await sock.sendMessage(ctx.jid, {
      text: `💞 *SHIPÓMETRO*\n${args[0]} ❤️ ${args[1]}\nCompatibilidad: *${percent}%*`
    })
  }
}