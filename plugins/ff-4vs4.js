const partidas = {}; // msgId -> { jugadores: Set, suplentes: Set, data }

export default {
  commands: ["4vs4"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    // =========================
    // VALIDAR ARGUMENTOS
    // =========================
    const modo = (args[0] || "").toLowerCase();
    const horaMX = args[1];

    if (!["fem", "masc", "mixto"].includes(modo) || !horaMX) {
      return sock.sendMessage(jid, {
        text:
          "❌ Uso correcto:\n" +
          ".4vs4 fem 2mx\n" +
          ".4vs4 masc 9mx\n" +
          ".4vs4 mixto 7mx"
      }, { quoted: msg });
    }

    const mx = parseInt(horaMX.replace("mx", ""));
    if (isNaN(mx)) {
      return sock.sendMessage(jid, {
        text: "❌ Hora inválida. Ejemplo: 2mx"
      }, { quoted: msg });
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

    // Guardar partida
    partidas[sent.key.id] = {
      jugadores: new Set(),
      suplentes: new Set(),
      jid,
      titulo,
      mx,
      col
    };
  },

  // =========================
  // EVENTO DE REACCIONES
  // =========================
  async onMessage(sock, msg) {
    if (!msg.message?.reactionMessage) return;

    const r = msg.message.reactionMessage;
    const msgId = r.key.id;
    const user = r.key.participant;

    const partida = partidas[msgId];
    if (!partida) return;

    const emoji = r.text; // ❤️ 👍 o ""

    // Quitar de ambas listas primero
    partida.jugadores.delete(user);
    partida.suplentes.delete(user);

    if (emoji === "❤️") {
      if (partida.jugadores.size < 4) {
        partida.jugadores.add(user);
      }
    }

    if (emoji === "👍") {
      if (partida.suplentes.size < 2) {
        partida.suplentes.add(user);
      }
    }

    // =========================
    // RECONSTRUIR MENSAJE
    // =========================
    const j = [...partida.jugadores];
    const s = [...partida.suplentes];

    const format = (arr, max) => {
      let out = "";
      for (let i = 0; i < max; i++) {
        out += `${i + 1}. ${arr[i] ? `@${arr[i].split("@")[0]}` : "—"}\n`;
      }
      return out.trim();
    };

    const nuevoTexto = `
⚔️ ${partida.titulo} ⚔️

🕒 HORARIOS
🇲🇽 México: ${partida.mx}MX
🇨🇴 Colombia: ${partida.col}COL

━━━━━━━━━━━━━━━

🎮 JUGADORES
${format(j, 4)}

🪑 SUPLENTES
${format(s, 2)}

━━━━━━━━━━━━━━━
❤️ = Jugador
👍 = Suplente
Quita la reacción para salir
`.trim();

    await sock.sendMessage(partida.jid, {
      text: nuevoTexto,
      edit: msgId,
      mentions: [...j, ...s]
    });
  }
};