//Codígo creado por Destroy wa.me/584120346669

export default {
  commands: ["penetrar", "penetrado"],
  category: "emox",
  group: true,

  async run(sock, msg, args, ctx) {

    // ===============================
    // OBTENER CONTEXTO (FIX REAL)
    // ===============================
    const context = msg.message?.extendedTextMessage?.contextInfo || {}

    const mentioned = context.mentionedJid || []

    let who

    if (mentioned.length > 0) {
      who = mentioned[0]
    } else if (context.participant) {
      who = context.participant
    } else {
      who = ctx.sender
    }

    const tagUser = "@" + who.split("@")[0]

    // ===============================
    // TEXTO
    // ===============================
    const responseMessage = `
*TE HAN LLENADO LA CARA DE SEMEN POR PUTA Y ZORRA!*

*Le ha metido el pene a ${args.join(" ") || tagUser}* con todo y condón hasta quedar seco, has dicho "por favor más duroooooo!, ahhhhhhh, ahhhhhh, hazme un hijo que sea igual de pitudo que tú!" mientras te penetraba y luego te ha dejado en silla de ruedas!

*${args.join(" ") || tagUser}*
🔥 *YA TE HAN PENETRADO!*`.trim()

    // ===============================
    // ENVIAR (FIX DEFINITIVO)
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        text: responseMessage,
        mentions: [who] // 🔥 etiqueta real
      },
      { quoted: msg }
    )
  }
}