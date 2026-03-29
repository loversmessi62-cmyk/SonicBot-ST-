//Codígo creado por Destroy wa.me/584120346669

import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('media/database/marry.json')
let marriages = loadMarriages()
const confirmation = {}

// 📂 Crear carpeta si no existe
const dir = path.dirname(marriagesFile)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

function loadMarriages() {
  try {
    return fs.existsSync(marriagesFile)
      ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8'))
      : {}
  } catch {
    return {}
  }
}

function saveMarriages() {
  fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2))
}

let handler = async (m, { conn }) => {

  const context = m.message?.extendedTextMessage?.contextInfo || {}
  const mentioned = context.mentionedJid || []

  const proposer = m.sender
  const proposee = mentioned[0] || context.participant

  const isMarry = /^\.?marry$/i.test(m.text)
  const isDivorce = /^\.?divorce$/i.test(m.text)

  const userIsMarried = (user) => marriages[user] !== undefined

  try {

    // 💍 CASARSE
    if (isMarry) {

      if (!proposee) {
        if (userIsMarried(proposer)) {
          return conn.reply(
            m.chat,
            `💍 Ya estás casado con @${marriages[proposer].split("@")[0]}`,
            m,
            { mentions: [marriages[proposer]] }
          )
        }
        throw 'Debes mencionar o responder a alguien.\nEjemplo: .marry @usuario'
      }

      if (proposer === proposee)
        throw 'No puedes casarte contigo mismo 😹'

      if (userIsMarried(proposer))
        throw 'Ya estás casado.'

      if (userIsMarried(proposee))
        throw 'Esa persona ya está casada.'

      conn.reply(
        m.chat,
        `💍 @${proposee.split("@")[0]}, @${proposer.split("@")[0]} te propone matrimonio 💖\n\nResponde:\n✔ Si\n❌ No`,
        m,
        { mentions: [proposer, proposee] }
      )

      confirmation[proposee] = {
        proposer,
        timeout: setTimeout(() => {
          conn.reply(m.chat, '⏰ Tiempo agotado.', m)
          delete confirmation[proposee]
        }, 60000)
      }
    }

    // 💔 DIVORCIO
    if (isDivorce) {

      if (!userIsMarried(proposer))
        throw 'No estás casado.'

      const partner = marriages[proposer]

      delete marriages[proposer]
      delete marriages[partner]
      saveMarriages()

      conn.reply(
        m.chat,
        `💔 @${proposer.split("@")[0]} y @${partner.split("@")[0]} se divorciaron.`,
        m,
        { mentions: [proposer, partner] }
      )
    }

  } catch (e) {
    conn.reply(m.chat, `❌ ${e}`, m)
  }
}

// 📩 RESPUESTAS (SI / NO)
handler.before = async (m, { conn }) => {

  if (!m.text) return
  if (!(m.sender in confirmation)) return

  const { proposer, timeout } = confirmation[m.sender]

  if (/^no$/i.test(m.text)) {
    clearTimeout(timeout)
    delete confirmation[m.sender]

    return conn.reply(m.chat, '❌ Propuesta rechazada.', m)
  }

  if (/^s[ií]$/i.test(m.text)) {

    marriages[proposer] = m.sender
    marriages[m.sender] = proposer
    saveMarriages()

    clearTimeout(timeout)
    delete confirmation[m.sender]

    return conn.reply(
      m.chat,
      `💖 ¡Se han casado!\n\n@${proposer.split("@")[0]} ❤️ @${m.sender.split("@")[0]}`,
      m,
      { mentions: [proposer, m.sender] }
    )
  }
}

handler.help = ['marry @tag', 'divorce']
handler.tags = ['rg']
handler.command = ['marry', 'divorce']
handler.group = true

export default handler