Ejemplo de uso:
*${usedPrefix + command}* 12345@newsletter NombreDelcanal\n\nPuede obtener el ID usando el comando:\n*${usedPrefix}superinspect* enlace${txtBotAdminCh}, m)
const [id, ...nameParts] = text.split(' ')
const name = nameParts.join(' ').trim()
if (name.length > 99) return await conn.reply(m.chat, > El nombre del canal no puede tener más de 99 caracteres.`, m)
if (text.includes("@newsletter")) {
ch = id.trim()
} else {
ch = await conn.newsletterMetadata("invite", channelUrl).then(data =>