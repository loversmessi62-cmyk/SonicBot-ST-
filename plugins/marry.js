export default {
  commands: ["marry"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    if (!msg.key.remoteJid.includes("@g.us")) {
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

━━━━━━━━━━━━━━━
Selecciona una opción:
`.trim();

    await sock.sendMessage(jid, {
      text: texto,
      mentions: [p1, p2],
      buttons: [
        { buttonId: `aceptar_${p1}_${p2}`, buttonText: { displayText: "💖 Aceptar" }, type: 1 },
        { buttonId: `rechazar_${p1}_${p2}`, buttonText: { displayText: "💔 Rechazar" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: msg });
  }
};