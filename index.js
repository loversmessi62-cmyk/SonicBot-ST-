const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const config = require("./config")
const fs = require("fs")

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./sessions")

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async (msg) => {
    const m = msg.messages[0]
    if (!m.message) return
    const from = m.key.remoteJid
    const body = m.message.conversation || m.message.extendedTextMessage?.text || ""

    if (!body.startsWith(config.prefix)) return
    const command = body.slice(1).trim().split(" ")[0]

    // cargar plugins
    const files = fs.readdirSync("./plugins")
    for (const file of files) {
      const plugin = require("./plugins/" + file)
      if (plugin.command === command) {
        return plugin.run(sock, m)
      }
    }
  })

  console.log("🔥 Adri-Bot iniciado!")
}

start()
