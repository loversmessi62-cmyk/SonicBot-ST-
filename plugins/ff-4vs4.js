export default {
  command: ["4vs4"],

  async run(sock, msg, args) {
    // ===============================
    // VALIDAR HORA
    // ===============================
    if (!args[0]) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Usa: *.4vs4 2mx*"
      }, { quoted: msg })
    }

    const match = args[0].match(/^(\d{1,2})(mx)$/i)
    if (!match) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Formato inválido. Ejemplo: *.4vs4 2mx*"
      }, { quoted: msg })
    }

    const baseHour = parseInt(match[1])

    // ===============================
    // ZONAS HORARIAS (DESDE MX)
    // ===============================
    const zonas = {
      "🇲🇽 México": baseHour,
      "🇨🇴 Colombia": baseHour + 1,
      "🇵🇪 Perú": baseHour + 1,
      "🇨🇱 Chile": baseHour + 2,
      "🇦🇷 Argentina": baseHour + 3,
      "🇧🇷 Brasil": baseHour + 3
    }

    const formatHour = h => {
      let hour = h % 24
      if (hour <= 0) hour += 24
      return `${hour}:00`
    }

    const horarios = Object.entries(zonas)
      .map(([pais, hora]) => `${pais}: ${formatHour(hora)}`)
      .join("\n")

    // ===============================
    // MENSAJE FINAL
    // ===============================
    const text = `
⚔️ *4 VS 4 FREE FIRE* ⚔️

🕒 *HORARIOS*
${horarios}

━━━━━━━━━━━━━━━
🎮 *JUGADORES*
1. —
2. —
3. —
4. —

🪑 *SUPLENTES*
1. —
2. —

📌 *Anótate escribiendo tu nombre*
🔥 *Modo serio*
`.trim()

    await sock.sendMessage(msg.key.remoteJid, {
      text
    }, { quoted: msg })
  }
}