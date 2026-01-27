export default {
  commands: ["top"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const { jid, participants, isGroup } = ctx

    if (!isGroup) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando solo funciona en grupos."
      }, { quoted: msg })
    }

    if (!args.length) {
      return sock.sendMessage(jid, {
        text: "⚠️ Usa: .top <texto>\nEjemplo: .top pendejos"
      }, { quoted: msg })
    }

    // 📝 texto del top
    const titulo = args.join(" ")

    // 👥 obtener participantes válidos
    const users = participants
      .map(p => p.id || p.jid)
      .filter(Boolean)

    if (users.length < 10) {
      return sock.sendMessage(jid, {
        text: "⚠️ Se necesitan al menos 10 personas en el grupo."
      }, { quoted: msg })
    }

    // 🎲 mezclar aleatoriamente
    const shuffled = users.sort(() => 0.5 - Math.random())

    // 🔟 tomar 10
    const top10 = shuffled.slice(0, 10)

    let text = `🏆 *TOP 10 ${titulo.toUpperCase()}*\n\n`
    let mentions = []

    top10.forEach((u, i) => {
      const name = u.split("@")[0]
      text += `${i + 1}. @${name}\n`
      mentions.push(u)
    })

    await sock.sendMessage(jid, {
      text,
      mentions
    })
  }
}