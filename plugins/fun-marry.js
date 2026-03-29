/* Código creado por Destroy
 - https://github.com/The-King-Destroy
*/

import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('media/database/marry.json')
let marriages = loadMarriages()
const confirmation = {}

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

let handler = async (m, { conn, command }) => {

  const userIsMarried = (user) => marriages[user] !== undefined

  const proposee = m.mentionedJid?.[0] || m.quoted?.sender
  const proposer = m.sender

  try {

    // 💍 CASARSE
    if (/^marry$/i.test(command)) {

      if (!proposee) {
        if (userIsMarried(proposer)) {
          return conn.reply(m.chat, "💍 Ya estás casado", m)
        }
        return conn.reply(m.chat, "❌ Menciona a alguien\nEjemplo: .marry @usuario", m)
      }

      if (proposer === proposee)
        return conn.reply(m.chat, "❌ No puedes casarte contigo mismo 😹", m)

      if (userIsMarried(proposer))
        return conn.reply(m.chat, "❌ Ya estás casado", m)

      if (userIsMarried(proposee))
        return conn.reply(m.chat, "❌ Esa persona ya está casada", m)

      await conn.reply(
        m.chat,
        `💍 @${proposee.split("@")[0]}, @${proposer.split("@")[0]} te propone matrimonio\n\nResponde:\n✔ Si\n❌ No`,
        m,
        { mentions: [proposee, proposer] }
      )

      confirmation[proposee] = {
        proposer,
        chat: m.chat,
        timeout: setTimeout(() => {
          conn.reply(m.chat, "⏰ Tiempo agotado", m)
          delete confirmation[proposee]
        }, 60000)
      }
    }

    // 💔 DIVORCIO
    if (/^divorce$/i.test(command)) {

      if (!userIsMarried(proposer))
        return conn.reply(m.chat, "❌ No estás casado", m)

      const partner = marriages[proposer]

      delete marriages[proposer]
      delete marriages[partner]
      saveMarriages()

      await conn.reply(
        m.chat,
        `💔 @${proposer.split("@")[0]} y @${partner.split("@")[0]} se divorciaron`,
        m,
        { mentions: [proposer, partner] }
      )
    }

  } catch (e) {
    conn.reply(m.chat, `❌ ${e.message}`, m)
  }
}

// RESPUESTAS
handler.before = async (m, { conn }) => {

  if (!(m.sender in confirmation)) return
  if (!m.text) return

  const { proposer, timeout } = confirmation[m.sender]

  if (/^no$/i.test(m.text)) {
    clearTimeout(timeout)
    delete confirmation[m.sender]
    return conn.reply(m.chat, "❌ Propuesta rechazada", m)
  }

  if (/^s[ií]$/i.test(m.text)) {

    marriages[proposer] = m.sender
    marriages[m.sender] = proposer
    saveMarriages()

    clearTimeout(timeout)
    delete confirmation[m.sender]

    return conn.reply(
      m.chat,
      `💖 @${proposer.split("@")[0]} ❤️ @${m.sender.split("@")[0]} ya están casados`,
      m,
      { mentions: [proposer, m.sender] }
    )
  }
}

handler.help = ['marry @user', 'divorce']
handler.tags = ['rg']
handler.command = /^(marry|divorce)$/i
handler.group = true

export default handler