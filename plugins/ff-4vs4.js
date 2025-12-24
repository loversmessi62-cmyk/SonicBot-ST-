export default {
  command: ["4vs4"],
  run: async (sock, msg, args) => {

    // =========================
    // VALIDAR ARGUMENTOS
    // =========================
    // Ej: .4vs4 fem 2mx
    const modo = (args[0] || "").toLowerCase()
    const horaMX = args[1]

    if (!["fem", "masc", "mixto"].includes(modo) || !horaMX) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Uso correcto:\n.4vs4 fem 2mx\n.4vs4 masc 9mx\n.4vs4 mixto 7mx"
      }, { quoted: msg })
    }

    // =========================
    // CALCULAR HORAS
    // =========================
    const mx = parseInt(horaMX.replace("mx", ""))
    if (isNaN(mx)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Hora inválida. Ejemplo: 2mx"
      }, { quoted: msg })
    }

    const col = (mx + 1) % 24

    // =========================
    // TITULO SEGÚN MODO
    // =========================
    const titulo =
      modo === "fem" ? "💗 4 VS 4 FEMENIL 💗" :
      modo === "masc" ? "💪 4 VS 4 VARONIL 💪" :
      "⚖️ 4 VS 4 MIXTO ⚖️"

    // =========================
    // MENSAJE FINAL
    // =========================
    const texto = `
⚔️ ${titulo} ⚔️

🕒 *HORARIOS*
🇲🇽 México: ${mx}MX
🇨🇴 Colombia: ${col}COL

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
      text: texto
    }, { quoted: msg })
  }
}