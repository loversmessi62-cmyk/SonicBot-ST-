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
},
{
texto: `💌 ⌈ Carta de Amor 🌙 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌌 Cada noche pienso en ti antes de dormir y sonrío como tonto/a. ✨`
},
{
texto: `💌 ⌈ Carta de Amor ☁️ ⌋ 💌
De: {remitente}
Para: {destinatario}

☁️ Contigo todo se siente más bonito, incluso los días difíciles. 💞`
},
{
texto: `💌 ⌈ Carta de Amor 💫 ⌋ 💌
De: {remitente}
Para: {destinatario}

💫 Eres esa persona que llegó sin avisar y se quedó en mi corazón. ❤️`
},
{
texto: `💌 ⌈ Carta de Amor 🥀 ⌋ 💌
De: {remitente}
Para: {destinatario}

🥀 A veces no encuentro palabras para describir lo mucho que significas para mí. 💖`
},
{
texto: `💌 ⌈ Carta de Amor 🌹 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌹 Si pudiera pedir un deseo, sería pasar más tiempo contigo. ✨`
},
{
texto: `💌 ⌈ Carta de Amor 🧸 ⌋ 💌
De: {remitente}
Para: {destinatario}

🧸 Tu forma de ser me da tranquilidad y felicidad al mismo tiempo. 💕`
},
{
texto: `💌 ⌈ Carta de Amor 🎀 ⌋ 💌
De: {remitente}
Para: {destinatario}

🎀 Eres la casualidad más bonita que me pudo pasar. 😍`
},
{
texto: `💌 ⌈ Carta de Amor 🌺 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌺 Tu sonrisa tiene el poder de alegrarme incluso en mis peores días. 💖`
},
{
texto: `💌 ⌈ Carta de Amor 🌻 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌻 Desde que llegaste, mi mundo tiene más color y más felicidad. ✨`
},
{
texto: `💌 ⌈ Carta de Amor 💘 ⌋ 💌
De: {remitente}
Para: {destinatario}

💘 No sé cómo lo hiciste, pero lograste robarte todos mis pensamientos. 😳`
},
{
texto: `💌 ⌈ Carta de Amor 🍓 ⌋ 💌
De: {remitente}
Para: {destinatario}

🍓 Hablar contigo se convirtió en mi parte favorita del día. 💕`
},
{
texto: `💌 ⌈ Carta de Amor 🌠 ⌋ 💌
De: {remitente}
Para: {destinatario}

🌠 Eres como una estrella: imposible no admirarte. ✨`
},
{
texto: `💌 ⌈ Carta de Amor 💞 ⌋ 💌
De: {remitente}
Para: {destinatario}

💞 A tu lado todo parece más tranquilo y bonito. 🥰`
},
{
texto: `💌 ⌈ Carta de Amor 🎶 ⌋ 💌
De: {remitente}
Para: {destinatario}

🎶 Cada canción romántica me termina recordando a ti. ❤️`
},
{
texto: `💌 ⌈ Carta de Amor 🫶 ⌋ 💌
De: {remitente}
Para: {destinatario}

🫶 Gracias por existir y hacerme sentir tan especial con solo hablarme. 💖`
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

// carta random
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