//Codígo creado por Destroy wa.me/584120346669

export default {
  commands: ["anal", "culiar"],
  category: "emox",
  group: true,

  async run(sock, msg, args, ctx) {

    // ===============================
    // EXTRAER CONTEXT INFO (CLAVE)
    // ===============================
    const context = msg.message?.extendedTextMessage?.contextInfo || {}

    const mentioned = context.mentionedJid || []

    let who

    if (mentioned.length) {
      who = mentioned[0]
    } else if (context.participant) {
      // ESTE ES EL FIX IMPORTANTE
      who = context.participant
    } else {
      who = ctx.sender
    }

    const sender = ctx.sender

    const tagSender = "@" + sender.split("@")[0]
    const tagWho = "@" + who.split("@")[0]

    // ===============================
    // TEXTO
    // ===============================
    let texto

    if (mentioned.length) {
      texto = `${tagSender} le partio el culo a la puta de ${tagWho}`
    } else if (context.participant) {
      texto = `${tagSender} se la metio en el ano a ${tagWho}`
    } else {
      texto = `${tagSender} esta haciendo un anal`
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
    // MENSAJE FINAL (CLAVE)
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        video: { url: video },
        gifPlayback: true,
        caption: texto,
        mentions: [sender, who] // 🔥 ESTO HACE QUE ETIQUETE
      },
      { quoted: msg }
    )
  }
}