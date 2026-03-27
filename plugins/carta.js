//Codígo creado por Destroy wa.me/584120346669

export default {
  commands: ["anal", "culiar"],
  category: "emox",
  group: true,

  async run(sock, msg, args, ctx) {

    // ===============================
    // DETECTAR USUARIO
    // ===============================
    const mentioned =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid

    let who
    if (mentioned?.length) {
      who = mentioned[0]
    } else if (msg.quoted?.sender) {
      who = msg.quoted.sender
    } else {
      who = ctx.sender
    }

    const remitente = ctx.sender
    const destinatario = who

    const nombreRem = remitente.split('@')[0]
    const nombreDes = destinatario.split('@')[0]

    // ===============================
    // FRASES
    // ===============================
    let texto

    if (mentioned?.length) {
      texto = `\`@${nombreRem}\` le partio el culo a la puta de \`@${nombreDes}\`.`
    } else if (msg.quoted?.sender) {
      texto = `\`@${nombreRem}\` se la metio en el ano a \`@${nombreDes}\`.`
    } else {
      texto = `\`@${nombreRem}\` esta haciendo un anal`
    }

    // ===============================
    // VIDEOS
    // ===============================
    const videos = [
      'https://telegra.ph/file/7185b0be7a315706d086a.mp4',
      'https://telegra.ph/file/a11625fef11d628d3c8df.mp4',
      'https://telegra.ph/file/062b9506656e89b069618.mp4',
      'https://telegra.ph/file/1325494a54adc9a87ec56.mp4',
      'https://qu.ax/KKazS.mp4',
      'https://qu.ax/ieJeB.mp4',
      'https://qu.ax/MCdGn.mp4'
    ]

    const video = videos[Math.floor(Math.random() * videos.length)]

    // ===============================
    // ENVIAR
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        video: { url: video },
        gifPlayback: true,
        caption: texto,
        mentions: [remitente, destinatario]
      },
      { quoted: msg }
    )
  }
}