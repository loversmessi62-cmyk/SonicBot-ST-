export default {
  commands: ["sintetas"],
  category: "funny",
  admin: false,

  async run(sock, msg, args, ctx) {
    try {
      const { jid } = ctx;

      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (!mentioned.length) {
        return sock.sendMessage(
          jid,
          {
            text: "⚠️ ¡Debes mencionar a alguien!\nEjemplo: *.sintetas @usuario*"
          },
          { quoted: msg }
        );
      }

      const userMentioned = mentioned[0];
      const numero = userMentioned.split("@")[0];
      const porcentaje = Math.floor(Math.random() * 100) + 1;

      const comentarios = [
        `😱 @${numero} tiene un ${porcentaje}% de estar sin tetas 😬`,
        `😂 Atención: @${numero} está ${porcentaje}% plana, nivel madera 🪵`,
        `📏 @${numero} alcanza un ${porcentaje}% en el ranking de tabla surf 🏄‍♀️`,
        `🤣 Confirmado: @${numero} posee ${porcentaje}% de pecho inexistente 🚫`
      ];

      const mensaje =
        comentarios[Math.floor(Math.random() * comentarios.length)];

      await sock.sendMessage(
        jid,
        {
          text: mensaje,
          mentions: [userMentioned]
        },
        { quoted: msg }
      );
    } catch (e) {
      console.error("❌ Error en sintetas:", e);
      await sock.sendMessage(
        ctx.jid,
        { text: "⚠️ Ocurrió un error al calcular el porcentaje 😢" },
        { quoted: msg }
      );
    }
  }
};