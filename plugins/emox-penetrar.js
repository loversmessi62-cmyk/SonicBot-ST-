//Codígo creado por Destroy wa.me/584120346669

let handler = async (m, { conn, text }) => {

    // ===============================
    // OBTENER USUARIO (BIEN HECHO)
    // ===============================
    let who
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender
    } else {
        who = m.sender
    }

    const tagUser = "@" + who.split("@")[0]

    // ===============================
    // TEXTO FINAL
    // ===============================
    const responseMessage = `
*TE HAN LLENADO LA CARA DE SEMEN POR PUTA Y ZORRA!*

*Le ha metido el pene a ${text ? text : tagUser}* con todo y condón hasta quedar seco, has dicho "por favor más duroooooo!, ahhhhhhh, ahhhhhh, hazme un hijo que sea igual de pitudo que tú!" mientras te penetraba y luego te ha dejado en silla de ruedas!

*${text ? text : tagUser}*
🔥 *YA TE HAN PENETRADO!*`.trim()

    // ===============================
    // ENVIAR MENSAJE (FIX CLAVE)
    // ===============================
    await conn.sendMessage(
        m.chat,
        {
            text: responseMessage,
            mentions: [who] // 🔥 ESTO HACE QUE ETIQUETE
        },
        { quoted: m }
    )
}

// ===============================
// CONFIG
// ===============================
handler.help = ['penetrar @user']
handler.tags = ['emox']
handler.command = /^(penetrar|penetrado)$/i
handler.group = true

export default handler