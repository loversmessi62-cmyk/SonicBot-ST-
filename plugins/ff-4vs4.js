const partidas = {};

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

🎮 *JUGADORES* ❤️
1. —
2. —
3. —
4. —

🪑 *SUPLENTES* 👍
1. —
2. —

📌 *Reacciona para anotarte*
❤️ = Jugador
👍 = Suplente
`.trim();

    const enviado = await sock.sendMessage(msg.key.remoteJid, {
      text: texto,
      mentions: []
    }, { quoted: msg });

    // Guardamos la partida y la KEY correcta del mensaje del bot
    partidas[enviado.key.id] = {
      jugadores: [],
      suplentes: [],
      modo,
      jid: msg.key.remoteJid,
      keyMsg: enviado.key // 👈 ESTA es la key buena
    };
  },

  onMessage: async (sock, msg) => {
    const reaction = msg.message?.reactionMessage;
    if (!reaction) return;

    const messageID = reaction.key.id;
    const userJid = reaction.sender;

    if (!partidas[messageID]) return;

    const partida = partidas[messageID];

    if (reaction.text === "❤️") {
      if (partida.jugadores.length < 4 && !partida.jugadores.includes(userJid)) {
        partida.jugadores.push(userJid);
      }
    }

    if (reaction.text === "👍") {
      if (partida.suplentes.length < 2 && !partida.suplentes.includes(userJid)) {
        partida.suplentes.push(userJid);
      }
    }

    // Reconstruimos mensaje con tags
    const jugadoresTags = partida.jugadores.map(j => `@${j.split("@")[0]}`);
    const suplentesTags = partida.suplentes.map(j => `@${j.split("@")[0]}`);

    const actualizado = `
⚔️ *4 VS 4 ${partida.modo.toUpperCase()}* ⚔️

🎮 *JUGADORES* ❤️
1. ${jugadoresTags[0] || "—"}
2. ${jugadoresTags[1] || "—"}
3. ${jugadoresTags[2] || "—"}
4. ${jugadoresTags[3] || "—"}

🪑 *SUPLENTES* 👍
1. ${suplentesTags[0] || "—"}
2. ${suplentesTags[1] || "—"}

📌 *Reacciona para anotarte*
❤️ = Jugador
👍 = Suplente
`.trim();

    // 🧠 Aquí editamos usando la key correcta guardada
    await sock.sendMessage(partida.jid, {
      text: actualizado,
      mentions: [...partida.jugadores, ...partida.suplentes],
      message: {
        protocolMessage: {
          key: partida.keyMsg, // 👈 Ahora SÍ usa la key del mensaje original
          type: 14,
          editedMessage: { conversation: actualizado }
        }
      }
    });
  }
};