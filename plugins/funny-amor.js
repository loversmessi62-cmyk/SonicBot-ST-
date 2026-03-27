export default {
  commands: ["amor"],
  category: "funny",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid || msg.chat;

    // Detectar usuario (mención o respuesta)
    let target = null;

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      target = msg.message.extendedTextMessage.contextInfo.participant;
    }

    if (!target) {
      return sock.sendMessage(jid, {
        text: "❤️ Etiqueta o responde a alguien"
      }, { quoted: msg });
    }

    // Generar porcentaje
    const percent = Math.floor(Math.random() * 101);
    const name = target.split("@")[0];

    // Mensajes dinámicos
    let resultado = "";
    if (percent < 30) resultado = "💔 Muy bajo...";
    else if (percent < 60) resultado = "😅 Puede mejorar...";
    else if (percent < 80) resultado = "😍 Hay química...";
    else resultado = "🔥 Amor intenso...";

    await sock.sendMessage(jid, {
      text: `💘 *@${name}*\n❤️ Amor: *${percent}%*\n${resultado}`,
      mentions: [target]
    }, { quoted: msg });
  }
};