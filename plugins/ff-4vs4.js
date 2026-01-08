const partidas = {};

const normalize = jid =>
  jid?.split("@")[0].replace(/[^0-9]/g, "");

export default {
  command: ["4vs4"],

  run: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const modo = (args[0] || "").toLowerCase();
    const horaMX = args[1];

    if (!["fem", "masc", "mixto"].includes(modo) || !horaMX) {
      return sock.sendMessage(jid, {
        text: "❌ Uso correcto:\n.4vs4 fem 2mx\n.4vs4 masc 9mx\n.4vs4 mixto 7mx"
      }, { quoted: msg });
    }

    const mx = parseInt(horaMX.replace("mx", ""));
    if (isNaN(mx)) {
      return sock.sendMessage(jid, { text: "❌ Hora inválida. Ej: 2mx" }, { quoted: msg });
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

    const enviado = await sock.sendMessage(jid, { text: texto, mentions: [] }, { quoted: msg });

    partidas[enviado.key.id] = {
      jugadores: [],
      suplentes: [],
      modo,
      jid,
      keyMsg: enviado.key
    };

    console.log("✅ Partida creada con ID:", enviado.key.id);
  },

  onMessage: async (sock, msg) => {
    const m = msg.message?.reactionMessage;
    if (!m) return;

    const reactedID = m.key?.id;
    const userJid = m.key?.participant || m.participant || msg.key.participant || m.key.remoteJid;
    const userNum = normalize(userJid);

    console.log("🔍 Reacción 4vs4 recibida:");
    console.log("MessageID:", reactedID);
    console.log("User JID:", userJid);
    console.log("User NUM:", userNum);
    console.log("Emoji:", m.text);

    if (!partidas[reactedID]) {
      console.log("❌ No es una partida activa");
      return;
    }

    const partida = partidas[reactedID];
    const jid = partida.jid;

    // Buscamos coincidencia en participants
    const participants = partida.participants || partida.groupMetadata?.participants || [];

    const match = participants.find(p => {
      const pid = normalize(p.id || p.jid);
      const pjid = normalize(p.jid);
      return pid === userNum || pjid === userNum || pjid === normalize(userJid);
    });

    if (!match) {
      console.log("❌ Usuario no coincide con ningún participant");
      return;
    }

    const finalJid = match.jid || match.id || match.jid;
    const tag = `@${finalJid.split("@")[0]}`;

    // Anotar en lista
    if (m.text === "❤️") {
      if (!partida.jugadores.includes(finalJid)) partida.jugadores.push(finalJid);
    }

    if (m.text === "👍") {
      if (!partida.suplentes.includes(finalJid)) partida.suplentes.push(finalJid);
    }

    const jugs = partida.jugadores.map(j => `@${j.split("@")[0]}`);
    const sups = partida.suplentes.map(s => `@${s.split("@")[0]}`);

    const nuevaLista = `
⚔️ *4 VS 4 ${partida.modo.toUpperCase()}* ⚔️

🎮 *JUGADORES* ❤️
1. ${jugs[0] || "—"}
2. ${jugs[1] || "—"}
3. ${jugs[2] || "—"}
4. ${jugs[3] || "—"}

🪑 *SUPLENTES* 👍
1. ${sups[0] || "—"}
2. ${sups[1] || "—"}

`.trim();

    await sock.sendMessage(jid, {
      text: nuevaLista,
      mentions: [...partida.jugadores, ...partida.suplentes]
    });

    console.log("🔥 Usuario anotado como:", tag);
  }
};