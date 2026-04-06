export default {
  commands: ["marry"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    if (!jid.endsWith("@g.us")) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando solo es para grupos."
      }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(jid);
    const participantes = metadata.participants
      .map(p => p.id)
      .filter(id => id !== sock.user.id);

    if (participantes.length < 2) {
      return sock.sendMessage(jid, {
        text: "❌ No hay suficientes personas para casar."
      }, { quoted: msg });
    }

    // 💑 Elegir pareja
    let p1 = participantes[Math.floor(Math.random() * participantes.length)];
    let p2;

    do {
      p2 = participantes[Math.floor(Math.random() * participantes.length)];
    } while (p2 === p1);

    const toM = (a) => '@' + a.split('@')[0];

    const texto = `
💍 *PROPUESTA DE MATRIMONIO*

👰 ${toM(p1)}
🤵 ${toM(p2)}

💖 ¿Aceptan casarse?
`.trim();

    await sock.sendMessage(jid, {
      text: texto,
      mentions: [p1, p2],
      footer: "Selecciona una opción",
      templateButtons: [
        {
          index: 1,
          quickReplyButton: {
            displayText: "💖 Aceptar",
            id: `aceptar_${p1}_${p2}`
          }
        },
        {
          index: 2,
          quickReplyButton: {
            displayText: "💔 Rechazar",
            id: `rechazar_${p1}_${p2}`
          }
        }
      ]
    }, { quoted: msg });
  }
};