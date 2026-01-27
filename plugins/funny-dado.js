export default {
  commands: ["dado"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const num = Math.floor(Math.random() * 6) + 1

    await sock.sendMessage(ctx.jid, {
      text: `🎲 Tirando el dado...\nResultado: *${num}*`
    })
  }
}