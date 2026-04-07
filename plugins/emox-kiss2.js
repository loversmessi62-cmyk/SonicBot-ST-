// Código creado por WillZek wa.me/50557865603

export default {
  commands: ["kiss", "besar"],
  category: "emox",
  group: true,

  async run(sock, msg, args, ctx) {

    // ===============================
    // CONTEXT INFO (CLAVE)
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

    const sender = ctx.sender

    // 🔥 Validar que existan (evita crash)
    if (!sender) return
    if (!who) who = sender

    const tagSender = "@" + sender.split("@")[0]
    const tagWho = "@" + who.split("@")[0]

    // ===============================
    // TEXTO
    // ===============================
    let texto

    if (mentioned.length > 0) {
      texto = `💋 ${tagSender} le dio besos a ${tagWho} ( ˘ ³˘)♥`
    } else if (context.participant) {
      texto = `💋 ${tagSender} besó a ${tagWho} 💕`
    } else {
      texto = `💋 ${tagSender} se besó a sí mismo 😳`
    }

    // ===============================
    // VIDEOS
    // ===============================
    const videos = [
      'https://telegra.ph/file/d6ece99b5011aedd359e8.mp4',
      'https://telegra.ph/file/ba841c699e9e039deadb3.mp4',
      'https://telegra.ph/file/6497758a122357bc5bbb7.mp4',
      'https://telegra.ph/file/8c0f70ed2bfd95a125993.mp4',
      'https://telegra.ph/file/826ce3530ab20b15a496d.mp4',
      'https://telegra.ph/file/f66bcaf1effc14e077663.mp4',
      'https://telegra.ph/file/e1dbfc56e4fcdc3896f08.mp4',
      'https://telegra.ph/file/0fc525a0d735f917fd25b.mp4',
      'https://telegra.ph/file/68643ac3e0d591b0ede4f.mp4',
      'https://telegra.ph/file/af0fe6eb00bd0a8a9e3a0.mp4'
    ]

    if (!videos.length) return

    const video = videos[Math.floor(Math.random() * videos.length)]

    // ===============================
    // ENVÍO
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        video: { url: video },
        gifPlayback: true,
        caption: texto,
        mentions: [sender, who] // 🔥 etiquetas funcionando
      },
      { quoted: msg }
    )
  }
}