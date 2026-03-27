export default {
  commands: ["formarnv"],
  category: "fun",
  group: true,

  async run(sock, msg, args, ctx) {

    // ===============================
    // OBTENER PARTICIPANTES
    // ===============================
    const metadata = await sock.groupMetadata(ctx.jid)
    const ps = metadata.participants.map(v => v.id)

    if (ps.length < 2) {
      return sock.sendMessage(ctx.jid, {
        text: "😏 Ups... se necesitan al menos 2 personas para formar una pareja coqueta 💕"
      }, { quoted: msg })
    }

    // ===============================
    // RANDOM
    // ===============================
    const getRandom = () => ps[Math.floor(Math.random() * ps.length)]

    let a = getRandom()
    let b

    do {
      b = getRandom()
    } while (b === a)

    const tagA = "@" + a.split("@")[0]
    const tagB = "@" + b.split("@")[0]

    // ===============================
    // MENSAJE FINAL
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        text: `💘 *Pareja traviesa del día:* ${tagA} 😏 + ${tagB} 💖\n\n🔥 ¡Se ven perfectos juntos! Tal vez sea hora de coquetear un poquito 😜💌\n💫 Que la chispa del amor los acompañe ✨`,
        mentions: [a, b]
      },
      { quoted: msg }
    )
  }
}