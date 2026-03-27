export default {
  commands: ["formartrio", "formartrios"],
  category: "fun",
  group: true,

  async run(sock, msg, args, ctx) {

    // ===============================
    // OBTENER PARTICIPANTES
    // ===============================
    const metadata = await sock.groupMetadata(ctx.jid)
    const ps = metadata.participants.map(v => v.id)

    if (ps.length < 3) {
      return sock.sendMessage(ctx.jid, {
        text: "❌ Necesito al menos 3 personas en el grupo"
      }, { quoted: msg })
    }

    // ===============================
    // MENSAJE DE BÚSQUEDA
    // ===============================
    await sock.sendMessage(ctx.jid, {
      text: "⌛ Buscando personas..."
    }, { quoted: msg })

    // Espera
    await new Promise(r => setTimeout(r, 3000))

    // ===============================
    // RANDOM SEGURO
    // ===============================
    const getRandom = () => ps[Math.floor(Math.random() * ps.length)]

    let a = getRandom()
    let b
    do { b = getRandom() } while (b === a)

    let c
    do { c = getRandom() } while (c === a || c === b)

    const tagA = "@" + a.split("@")[0]
    const tagB = "@" + b.split("@")[0]
    const tagC = "@" + c.split("@")[0]

    // ===============================
    // MENSAJE FINAL
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        text: `😏 *Hey!!! ${tagA}, ${tagB} y ${tagC} han pensado en hacer un trío? ustedes 3 hacen buena combinación*`,
        mentions: [a, b, c]
      },
      { quoted: msg }
    )
  }
}