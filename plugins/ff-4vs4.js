const partidas = {}; // messageID → { jugadores: [], suplentes: [], modo }

export default {
  command: ["4vs4"],
  run: async (sock, msg, args) => {
    const modo = (args[0] || "").toLowerCase();
    const horaMX = args[1];

    if (!["fem", "masc", "mixto"].includes(modo) || !horaMX) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Uso correcto:\n.4vs4 fem 2mx\n.4vs4 masc 9mx\n.4vs4 mixto 7mx"
      }, { quoted: msg });
    }

    const mx = parseInt(horaMX.replace("mx", ""));
    if (isNaN(mx)) {
      return sock.sendMessage(msg.key.remoteJid, { text: "❌ Hora inválida. Ej: 2mx" }, { quoted: msg });
    }

    const col = (mx + 1) % 24;
    const titulo =
      modo === "fem" ? "4 VS 4 FEMENIL" :
      modo === "masc" ? "4 VS 4 VARONIL" :
      "4 VS 4 MIXTO";

    const texto = `
⚔️ *${titulo}* ⚔️

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

📌 *Anótate reaccionando a este mensaje*
🔥 = anotarme
⚡ = anotarme
`.trim();

    const enviado = await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });

    // Guardamos la partida asociada a ese mensaje
    partidas[enviado.key.id] = {
      jugadores: [],
      suplentes: [],
      modo
    };
  },

  // ===========================================
  // ⚡ DETECTAR REACCIONES PARA ANOTARSE ⚡
  // ===========================================
  onMessage: async (sock, msg) => {
    const reaction = msg.message?.reactionMessage;
    if (!reaction) return;

    const messageID = reaction.key.id;
    const sender = reaction.sender.replace(/@s\.whatsapp\.net|@lid/g, "");

    if (!partidas[messageID]) return; // No es una partida activa

    const partida = partidas[messageID];

    // Evitar duplicados
    if (partida.jugadores.includes(sender) || partida.suplentes.includes(sender)) {
      return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Ya estás anotado." });
    }

    // Meter a jugadores o suplentes
    if (partida.jugadores.length < 4) {
      partida.jugadores.push(sender);
    } else if (partida.suplentes.length < 2) {
      partida.suplentes.push(sender);
    } else {
      return sock.sendMessage(msg.key.remoteJid, { text: "❌ Ya no hay slots disponibles." });
    }

    // =========================
    // ACTUALIZAR MENSAJE
    // =========================
    const actualizado = `
⚔️ *4 VS 4 ${partida.modo.toUpperCase()}* ⚔️

🕒 *HORARIOS*
🇲🇽 México
🇨🇴 Colombia

━━━━━━━━━━━━━━━

🎮 *JUGADORES*
1. ${partida.jugadores[0] || "—"}
2. ${partida.jugadores[1] || "—"}
3. ${partida.jugadores[2] || "—"}
4. ${partida.jugadores[3] || "—"}

🪑 *SUPLENTES*
1. ${partida.suplentes[0] || "—"}
2. ${partida.suplentes[1] || "—"}

📌 *Anótate reaccionando*
🔥 / ⚡ = anotarme
`.trim();

    await sock.sendMessage(msg.key.remoteJid, {
      text: actualizado,
      edit: messageID
    });
  }
};