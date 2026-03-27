const cartas = [
{
texto: `💌 ⌈ Carta de Amor 🌸 ⌋ 💌
De: {remitente}
Para: {destinatario}

✨ Solo quería recordarte lo especial que eres para mí y cuánto iluminas mis días. 💖`
},
{
texto: `💌 ⌈ Carta de Amor 🌷 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌼 Me he enamorado de tu dulzura, tu sonrisa y cada pequeño detalle que te hace único/a. 💕`
},
{
texto: `💌 ⌈ Carta de Amor 🌟 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌸 Te quiero más que ayer, y cada día descubro nuevas razones para quererte aún más. 🥰`
},
{
texto: `💌 ⌈ Carta de Amor 🐻 ⌋ 💌
De: {remitente}
Para: {destinatario}

💖 Eres mi alegría diaria, mi abrazo en la distancia y mi razón para sonreír siempre. 🌷`
},
{
texto: `💌 ⌈ Carta de Amor 🌈 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌹 Gracias por existir y llenar mi mundo de colores y ternura. Siempre pienso en ti. 💕`
}
]

export default {
command: ['carta'],
tags: ['funny'],
help: ['carta @usuario', 'carta (responder mensaje)'],
group: false,

async run(sock, msg, args, ctx) {

const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || {}

const mentioned = ctxInfo.mentionedJid || []

let who
if (mentioned.length) {
  who = mentioned[0]
} else if (ctxInfo.participant) {
  who = ctxInfo.participant
} else {
  who = ctx.sender
}

const remitente = ctx.sender
const destinatario = who

const nombreRem = remitente.split('@')[0]
const nombreDes = destinatario.split('@')[0]

// carta aleatoria
const carta = cartas[Math.floor(Math.random() * cartas.length)]

const mensajeFinal = carta.texto
  .replace('{remitente}', `@${nombreRem}`)
  .replace('{destinatario}', `@${nombreDes}`)

// enviar
await sock.sendMessage(
  ctx.jid,
  {
    text: mensajeFinal,
    mentions: [remitente, destinatario]
  },
  { quoted: msg }
)

}
}