import fs from 'fs'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const commandsList = [
'disney','actas','adicionales','alimentos','autobus','boletos','canva','certificados','citas','codigos','combo','combos2','combos3','combos4','combos5','constancias','diamantes','descuentos','dinamica','facturas','fichareportes','gamepass','hbo','imss','justificantes','linkreportes','linkcodigos','libros','lote','maxeo','numerovirtual','netflix','prime','pasesff','pago','pago2','pago3','pago4','pago5','paquete','paquete2','paquete3','paquete4','paquete5','pedrial','peliculas','promo','procesos','programas','promoday','preciosbot','rebote','recargas','recetas','reembolsos','reglas','reportes','rfc','servicios','seguros','spotify','stock','stock2','stock3','stock4','stock5','stock6','stock7','stock8','stock9','stock10','shein','tanda','tramites','universidad','vigencia','vuelos','vix','universal','youtube'
]

const filePath = './ventas.json'

export default {
command: commandsList.flatMap(cmd => [`set${cmd}`, cmd, `del${cmd}`]),
category: 'ventas',
group: true,
admin: true,
botAdmin: true,

run: async (client, m, args, usedPrefix, command) => {
const chatId = m.chat

let dataBase = fs.existsSync(filePath)
? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
: {}

if (!dataBase[chatId]) dataBase[chatId] = {}

const baseCommand = command.replace(/^set|^del/, '')
const prev = dataBase[chatId][baseCommand] || {}

if (command.startsWith('set')) {
const text = args.join(' ').trim()

const quoted = m.quoted
const directImage = m.msg?.mimetype?.startsWith('image/')
const quotedImage = quoted?.mimetype?.startsWith('image/')

const texto =
text ||
m.text?.replace(new RegExp(`^${usedPrefix}${command}`, 'i'), '').trim() ||
quoted?.text ||
quoted?.caption ||
''

if (!texto && !directImage && !quotedImage) {
return m.reply(`《✧》 Envía o responde a texto o imagen para guardar.\n> ${usedPrefix + command} ejemplo`)
}

let imagenBase64 = null

try {
if (quotedImage) {
const stream = await downloadContentFromMessage(quoted.msg, 'image')
let buffer = Buffer.alloc(0)
for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
imagenBase64 = buffer.toString('base64')
} else if (directImage) {
const stream = await downloadContentFromMessage(m.msg, 'image')
let buffer = Buffer.alloc(0)
for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
imagenBase64 = buffer.toString('base64')
}
} catch {}

dataBase[chatId][baseCommand] = {
texto: texto || prev.texto || '',
imagen: imagenBase64 ?? prev.imagen ?? null
}

fs.writeFileSync(filePath, JSON.stringify(dataBase, null, 2))

return m.reply(`✅ ${baseCommand} guardado correctamente`)
}

if (command.startsWith('del')) {
if (!dataBase[chatId][baseCommand]) {
return m.reply('⚠️ No hay datos para eliminar')
}

delete dataBase[chatId][baseCommand]
fs.writeFileSync(filePath, JSON.stringify(dataBase, null, 2))

return m.reply(`🚮 ${baseCommand} eliminado correctamente`)
}

const data = dataBase[chatId][baseCommand]

if (!data || (!data.texto && !data.imagen)) {
return m.reply(`⚠️ No hay información guardada\n> Usa ${usedPrefix}set${baseCommand}`)
}

if (data.imagen) {
const buffer = Buffer.from(data.imagen, 'base64')
return client.sendMessage(m.chat, {
image: buffer,
caption: data.texto || baseCommand
}, { quoted: m })
}

return m.reply(data.texto)
},
}