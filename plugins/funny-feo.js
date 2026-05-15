export default {
  commands: ["feo"],
  category: "funny",

  async run(sock, msg, args, ctx) {

    // ===============================
    // DETECTAR USUARIO
    // ===============================
    const context =
      msg.message?.extendedTextMessage?.contextInfo || {}

    const mentioned = context.mentionedJid || []

    const target =
      mentioned[0] ||
      context.participant

    if (!target) {
      return sock.sendMessage(
        ctx.jid,
        {
          text: "🪞 Menciona o responde a alguien"
        },
        { quoted: msg }
      )
    }

    const name = target.split("@")[0]

    // ===============================
    // MENSAJE INICIAL
    // ===============================
    const sent = await sock.sendMessage(
      ctx.jid,
      {
        text: "🪞 Analizando fealdad...\n\n▒▒▒▒▒▒▒▒▒▒ 0%"
      },
      { quoted: msg }
    )

    // ===============================
    // BARRAS
    // ===============================
    const barras = [
      "█▒▒▒▒▒▒▒▒▒ 10%",
      "██▒▒▒▒▒▒▒▒ 20%",
      "███▒▒▒▒▒▒▒ 30%",
      "████▒▒▒▒▒▒ 40%",
      "█████▒▒▒▒▒ 50%",
      "██████▒▒▒▒ 60%",
      "███████▒▒▒ 70%",
      "████████▒▒ 80%",
      "█████████▒ 90%",
      "██████████ 100%"
    ]

    // ===============================
    // EDITAR MISMO MENSAJE
    // ===============================
    for (const barra of barras) {

      await new Promise(r => setTimeout(r, 400))

      await sock.sendMessage(
        ctx.jid,
        {
          text: `🪞 Analizando fealdad...\n\n${barra}`,
          edit: sent.key
        }
      ).catch(() => {})
    }

    // ===============================
    // RESULTADO FINAL
    // ===============================
    await new Promise(r => setTimeout(r, 500))

    await sock.sendMessage(
      ctx.jid,
      {
        text: `🪞 *@${name}*, el espejo pidió vacaciones 💀`,
        mentions: [target],
        edit: sent.key
      }
    ).catch(async () => {

      // fallback
      await sock.sendMessage(
        ctx.jid,
        {
          text: `🪞 *@${name}*, el espejo pidió vacaciones 💀`,
          mentions: [target]
        },
        { quoted: msg }
      )

    })
  }
}