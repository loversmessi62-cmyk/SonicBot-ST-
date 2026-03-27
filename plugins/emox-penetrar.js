//Codígo creado por Destroy wa.me/584120346669

let handler = async (m, { conn, text }) => {

    if (!m.isGroup) return

    // ===============================
    // DETECTAR USUARIO (SIN ERROR)
    // ===============================
    let user

    if (m.mentionedJid && m.mentionedJid.length > 0) {
        user = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
        user = m.quoted.sender
    } else {
        user = m.sender
    }

    const tag = '@' + user.split('@')[0]

    // ===============================
    // MENSAJE
    // ===============================
    const responseMessage = `
*TE HAN LLENADO LA CARA DE SEMEN POR PUTA Y ZORRA!*

*Le ha metido el pene a ${tag}* con todo y condón hasta quedar seco, has dicho "por favor más duroooooo!, ahhhhhhh, ahhhhhh, hazme un hijo que sea igual de pitudo que tú!" mientras te penetraba y luego te ha dejado en silla de ruedas!

*${tag}* 
🔥 *YA TE HAN PENETRADO!*`

    // ===============================
    // ENVÍO CORRECTO (CON MENTIONS)
    // ===============================
    await conn.sendMessage(
        m.chat,
        {
            text: responseMessage,
            mentions: [user]
        },
        { quoted: m }
    )
}

// CONFIG
handler.help = ['penetrar @user']
handler.tags = ['emox']
handler.command = /^(penetrar|penetrado)$/i
handler.group = true
handler.fail = null

export default handler