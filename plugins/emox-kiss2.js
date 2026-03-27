// Código creado por WillZek wa.me/50557865603

let handler = async (m, { conn }) => {

  // Solo grupos
  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)
  }

  let who
  const mentioned = m.mentionedJid || []

  // Detectar usuario correctamente
  if (mentioned.length > 0) {
    who = mentioned[0]
  } else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender
  } else {
    who = m.sender
  }

  // Nombres (fallback por si falla getName)
  let name = await conn.getName(who).catch(() => who)
  let name2 = await conn.getName(m.sender).catch(() => m.sender)

  // Reacción (segura)
  if (m.react) {
    try {
      await m.react('🫦')
    } catch {}
  }

  // Mensaje
  let str
  if (mentioned.length > 0) {
    str = `💋 @${m.sender.split('@')[0]} le dio besos a @${who.split('@')[0]} ( ˘ ³˘)♥`
  } else if (m.quoted && m.quoted.sender) {
    str = `💋 @${m.sender.split('@')[0]} besó a @${who.split('@')[0]} 💕`
  } else {
    str = `💋 @${m.sender.split('@')[0]} se besó a sí mismo 😳`
  }

  // Videos
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

  const video = videos[Math.floor(Math.random() * videos.length)]

  // Enviar mensaje
  await conn.sendMessage(
    m.chat,
    {
      video: { url: video },
      gifPlayback: true,
      caption: str,
      mentions: [m.sender, who]
    },
    { quoted: m }
  )
}

handler.help = ['kiss @tag', 'besar @tag']
handler.tags = ['emox']
handler.command = /^(kiss|besar)$/i
handler.group = true

export default handler