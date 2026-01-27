export const partidas = {};

export default {
  commands: ["4vs4"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    const modo = (args[0] || "").toLowerCase();
    const horaMX = args[1];

    if (!["fem", "masc", "mixto"].includes(modo) || !horaMX) {
      return sock.sendMessage(jid, {
        text: "❌ Uso:\n.4vs4 fem 2mx\n.4vs4 masc 9mx\n.4vs4 mixto 7mx"
      }, { quoted: msg });
    }

    const mx = parseInt(horaMX.replace("mx", ""));
    if (isNaN(mx)) {
      return sock.sendMessage(jid, { text: "❌ Hora inválida" }, { quoted: msg });
    }

    const col = (mx + 1) % 24;

    const titulo =
      modo === "fem" ? "💗 4 VS 4 FEMENIL 💗" :
      modo === "masc" ? "💪 4 VS 4 VARONIL 💪" :
      "⚖️ 4 VS 4 MIXTO ⚖️";

    const texto = `
⚔️ ${titulo} ⚔️

🕒 HORARIOS
🇲🇽 México: ${mx}MX
🇨🇴 Colombia: ${col}COL

━━━━━━━━━━━━━━━

🎮 JUGADORES
1. —
2. —
3. —
4. —

🪑 SUPLENTES
1. —
2. —

━━━━━━━━━━━━━━━
❤️ = Jugador
👍 = Suplente
Quita la reacción para salir
`.trim();

    const sent = await sock.sendMessage(jid, { text: texto }, { quoted: msg });

    const uid = sent.key.id + jid; // 🔥 ID REAL

    partidas[uid] = {
      jid,
      titulo,
      mx,
      col,
      jugadores: new Set(),
      suplentes: new Set()
    };
  }
};