/* Código creado por Destroy
 - https://github.com/The-King-Destroy
*/

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

export default {
  commands: ["marry", "divorce"],
  category: "rg",
  group: true,

  async run(sock, msg, args, ctx) {

    const command = ctx.command
    const sender = ctx.sender

    const context = msg.message?.extendedTextMessage?.contextInfo || {}
    const mentioned = context.mentionedJid || []

    const userIsMarried = (user) => marriages[user] !== undefined

    try {

      // 💍 CASARSE
      if (/^marry$/i.test(command)) {

        let proposee

        if (mentioned.length) {
          proposee = mentioned[0]
        } else if (context.participant) {
          proposee = context.participant
        }

        if (!proposee) {
          if (userIsMarried(sender)) {
            return sock.sendMessage(ctx.jid, {
              text: `💍 Ya estás casado`,
            }, { quoted: msg })
          }

          return sock.sendMessage(ctx.jid, {
            text: "❌ Debes mencionar a alguien\nEjemplo: .marry @usuario"
          }, { quoted: msg })
        }

        if (sender === proposee)
          return sock.sendMessage(ctx.jid, { text: "❌ No puedes casarte contigo mismo 😹" }, { quoted: msg })

        if (userIsMarried(sender))
          return sock.sendMessage(ctx.jid, { text: "❌ Ya estás casado" }, { quoted: msg })

        if (userIsMarried(proposee))
          return sock.sendMessage(ctx.jid, { text: "❌ Esa persona ya está casada" }, { quoted: msg })

        const name1 = "@" + sender.split("@")[0]
        const name2 = "@" + proposee.split("@")[0]

        await sock.sendMessage(ctx.jid, {
          text: `💍 ${name2}, ${name1} te propone matrimonio\n\nResponde:\n✔ Si\n❌ No`,
          mentions: [sender, proposee]
        }, { quoted: msg })

        confirmation[proposee] = {
          proposer: sender,
          chat: ctx.jid,
          timeout: setTimeout(() => {
            sock.sendMessage(ctx.jid, {
              text: "⏰ Tiempo agotado. Propuesta cancelada."
            })
            delete confirmation[proposee]
          }, 60000)
        }
      }

      // 💔 DIVORCIO
      if (/^divorce$/i.test(command)) {

        if (!userIsMarried(sender)) {
          return sock.sendMessage(ctx.jid, {
            text: "❌ No estás casado"
          }, { quoted: msg })
        }

        const partner = marriages[sender]

        delete marriages[sender]
        delete marriages[partner]
        saveMarriages()

        await sock.sendMessage(ctx.jid, {
          text: `💔 @${sender.split("@")[0]} y @${partner.split("@")[0]} se divorciaron`,
          mentions: [sender, partner]
        }, { quoted: msg })
      }

    } catch (e) {
      sock.sendMessage(ctx.jid, {
        text: `❌ ${e.message}`
      }, { quoted: msg })
    }
  },

  async before(sock, msg, ctx) {

    if (!msg.message) return

    const sender = ctx.sender

    if (!(sender in confirmation)) return

    const text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text || ""

    const data = confirmation[sender]

    // ❌ RECHAZAR
    if (/^no$/i.test(text)) {
      clearTimeout(data.timeout)
      delete confirmation[sender]

      return sock.sendMessage(ctx.jid, {
        text: "❌ Propuesta rechazada"
      }, { quoted: msg })
    }

    // ✔ ACEPTAR
    if (/^s[ií]$/i.test(text)) {

      marriages[data.proposer] = sender
      marriages[sender] = data.proposer
      saveMarriages()

      clearTimeout(data.timeout)
      delete confirmation[sender]

      return sock.sendMessage(ctx.jid, {
        text: `💖 ¡Se han casado!\n\n@${data.proposer.split("@")[0]} ❤️ @${sender.split("@")[0]}`,
        mentions: [data.proposer, sender]
      }, { quoted: msg })
    }
  }
}