export default {
  commands: ["brat"],
  category: "grupo",
  description: "Sticker BRAT (fondo blanco, letras negras)",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;
    let text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ Ejemplo:\n.brat HOLA" },
        { quoted: msg }
      );
    }

    // límite para evitar errores de la API
    if (text.length > 80) text = text.slice(0, 77) + "...";

    // MAYÚSCULAS estilo BRAT
    text = text.toUpperCase();

    try {
      // API BRAT estable (imagen lista)
      const url =
        "https://api.xzere.dev/api/brat?text=" +
        encodeURIComponent(text);

      await sock.sendMessage(
        jid,
        { sticker: { url } },
        { quoted: msg }
      );

    } catch (e) {
      console.error("❌ BRAT error:", e);
      await sock.sendMessage(
        jid,
        { text: "❌ Error generando el sticker brat." },
        { quoted: msg }
      );
    }
  }
};
