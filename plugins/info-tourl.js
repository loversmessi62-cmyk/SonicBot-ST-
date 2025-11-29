export default {
  commands: ["tourl"],
  help: ["tourl"],
  tags: ["tools"],

  run: async (sock, msg, args, ctx) => {
    try {
      let quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      // Detectar imagen citada
      let img = null;

      if (quoted && quoted.imageMessage) {
        img = quoted.imageMessage;
      } else if (msg.message?.imageMessage) {
        img = msg.message.imageMessage;
      }

      if (!img) {
        return sock.sendMessage(msg.key.remoteJid, { text: "📷 Responde o envía una *imagen*." });
      }

      // Descargar la imagen
      const buffer = await sock.downloadMediaMessage({
        message: { imageMessage: img }
      });

      if (!buffer) {
        return sock.sendMessage(msg.key.remoteJid, { text: "❌ No se pudo descargar la imagen." });
      }

      sock.sendMessage(msg.key.remoteJid, { text: "⏳ Subiendo a imgbb..." });

      let apiKey = "6d3b9f27859e88c0c7f387672d2dd4c9";

      let form = new FormData();
      form.append("image", buffer.toString("base64"));

      let res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: form
      });

      let json = await res.json();

      if (!json.success) {
        return sock.sendMessage(msg.key.remoteJid, { text: "❌ Error subiendo a imgbb." });
      }

      let url = json.data.url;

      sock.sendMessage(msg.key.remoteJid, {
        text: `✅ *URL Generada:*\n${url}`
      });

    } catch (e) {
      console.log("ERROR TOUR", e);
      sock.sendMessage(msg.key.remoteJid, { text: "❌ Hubo un error procesando la imagen." });
    }
  }
}
