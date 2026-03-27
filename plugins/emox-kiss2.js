// Código creado por WillZek wa.me/50557865603

let handler = async (m, { conn }) => {
    let who

    // Detectar mención o respuesta correctamente
    const mentioned = m.mentionedJid || []
    const quoted = m.quoted

    if (mentioned.length) {
        who = mentioned[0]
    } else if (quoted) {
        who = quoted.sender
    } else {
        who = m.sender
    }

    const name = await conn.getName(who)
    const name2 = await conn.getName(m.sender)

    // Reacción segura
    try {
        await m.react('🫦')
    } catch {}

    // Construcción del mensaje
    let str
    if (mentioned.length) {
        str = `\`${name2}\` le dio besos a \`${name || '@' + who.split('@')[0]}\` ( ˘ ³˘)♥.`
    } else if (quoted) {
        str = `\`${name2}\` besó a \`${name || '@' + who.split('@')[0]}\` 💋.`
    } else {
        str = `\`${name2}\` se besó a sí mismo ( ˘ ³˘)♥`
    }

    // Solo grupos
    if (!m.isGroup) return

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

    await conn.sendMessage(
        m.chat,
        {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who]
        },
        { quoted: m }
    )
}

handler.help = ['kiss @tag', 'besar @tag']
handler.tags = ['emox']
handler.command = /^(kiss|besar)$/i
handler.group = true

export default handler