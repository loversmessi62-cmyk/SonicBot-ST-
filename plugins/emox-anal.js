//Codígo creado por Destroy wa.me/584120346669

export default {
  commands: ["anal", "culiar"],
  category: "emox",
  group: true,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid

    let who
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    // detectar mención o respuesta
    if (mentioned.length > 0) {
      who = mentioned[0]
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      who = msg.message.extendedTextMessage.contextInfo.participant
    } else {
      who = msg.key.participant || msg.key.remoteJid
    }

    const getName = async (id) => {
      try {
        return await sock.getName(id)
      } catch {
        return id.split("@")[0]
      }
    }

    let name = await getName(who)
    let name2 = await getName(msg.key.participant || msg.key.remoteJid)

    let str
    if (mentioned.length > 0) {
      str = `\`${name2}\` le partio el culo a la puta de \`${name}\`.`
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      str = `\`${name2}\` se la metio en el ano a \`${name}\`.`
    } else {
      str = `\`${name2}\` esta haciendo un anal`
    }

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

    await sock.sendMessage(jid, {
      video: { url: video },
      gifPlayback: true,
      caption: str,
      mentions: [who]
    }, { quoted: msg })
  }
}