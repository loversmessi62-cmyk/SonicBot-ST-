module.exports = {
  command: "menu",
  run: async (sock, m) => {
    await sock.sendMessage(m.key.remoteJid, {
      text: "📌 *ADRI-BOT*\n\nComandos disponibles:\n.menu\n.ping\n.hola"
    })
  }
}
