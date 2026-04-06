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
        text: "❌ No hay suficientes personas."
      }, { quoted: msg });
    }

    const toM = (a) => '@' + a.split('@')[0];

    let p1 = participantes[Math.floor(Math.random() * participantes.length)];
    let p2;

    do {
      p2 = participantes[Math.floor(Math.random() * participantes.length)];
    } while (p2 === p1);

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
      buttons: [
        {
          buttonId: `marry_aceptar_${p1}_${p2}`,
          buttonText: { displayText: "💖 Aceptar" },
          type: 1
        },
        {
          buttonId: `marry_rechazar_${p1}_${p2}`,
          buttonText: { displayText: "💔 Rechazar" },
          type: 1
        }
      ],
      headerType: 1,
      contextInfo: {
        mentionedJid: [p1, p2] // 🔥 CLAVE para que aparezcan
      }
    }, { quoted: msg });
  }
};