const partidas = {};

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
      modo === "fem" ? "💗 4 VS 4 FEMENIL 💗" :
      modo === "masc" ? "💪 4 VS 4 VARONIL 💪" :
      "⚖️ 4 VS 4 MIXTO ⚖️";

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

    const enviado = await sock.sendMessage(jid, {
      text: texto,
      mentions: []
    }, { quoted: msg });

    // Guardamos el ID del mensaje del bot para compararlo después
    partidas[enviado.key.id] = {
      jugadores: [],
      suplentes: [],
      modo,
      jid,
      keyMsg: enviado.key
    };

    console.log("✅ Mensaje 4vs4 enviado con ID:", enviado.key.id);
  },

  // =======================================
  // 🔍 DEBUG DE REACCIONES DENTRO DEL MISMO PLUGIN
  // =======================================
  onMessage: async (sock, msg) => {
    const reaction = msg.message?.reactionMessage;
    if (!reaction) return;

    const m = msg.message.reactionMessage;

    const userInfo = {
      reactedMessageID: m.key?.id,
      remoteJid: m.key?.remoteJid,
      participant: m.key?.participant,
      sender: m.sender,
      userJid: m.sender,
      pushName: msg.pushName,
      fromMe: msg.key?.fromMe,
      botID: sock.user?.id,
      emoji: m.text
    };

    console.log("\n========= 🔍 4VS4 REACTION DEBUG =========");
    console.log("📩 ID mensaje reaccionado:", userInfo.reactedMessageID);
    console.log("🌐 Grupo:", userInfo.remoteJid);
    console.log("👤 Participant:", userInfo.participant);
    console.log("🔢 Sender:", userInfo.sender);
    console.log("🏷️ Nombre:", msg.pushName);
    console.log("🤖 Bot ID:", sock.user?.id);
    console.log("❤️ Emoji reaccionado:", m.text);
    console.log("📦 JSON evento completo:", JSON.stringify(msg, null, 2));
    console.log("========= 🔍 END DEBUG =========\n");
  }
};