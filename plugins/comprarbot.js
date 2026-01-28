export default {
  commands: ["comprarbot", "comprar"],
  category: "info",

  async run(sock, msg, args, ctx) {
    const jid = ctx?.jid || msg.key.remoteJid;

    // Si quieres usar la variable global original, se respetará.
    const text =
      global.ComprarBot ||
      `🔹 VENTA DE BOTS 🔹

Automatiza tu grupo y recibe soporte 24/7

BOT PARA GRUPO: 📲 wa.me/+522731590195
BOT PARA GRUPO PERMANENTE: 📲 wa.me/+522731590195

⚡ Rápido • Seguro • Personalizado
`;

    // Si global.ComprarBot no existe, la creamos para compatibilidad
    if (!global.ComprarBot) global.ComprarBot = text;

    try {
      await sock.sendMessage(jid, { text }, { quoted: msg });
    } catch (err) {
      console.error("Error enviando mensaje en plugin comprarbot:", err);
    }
  },
};