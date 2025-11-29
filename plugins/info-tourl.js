import fetch from "node-fetch";
import FormData from "form-data";

export default {
  commands: ["tourl"],   // 👈 TU BASE SOLO ACEPTA ESTO
  admin: false,          // opcional

  run: async (sock, msg, args, ctx) => {
    try {
      let quoted = msg.message?.imageMessage
        ? msg
        : msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted)
        return sock.sendMessage(msg.key.remoteJid, {
          text: "📷 *Responde a una imagen para convertirla a URL.*",
        });

      let mime =
        quoted.imageMessage?.mimetype ||
        quoted.stickerMessage?.mimetype ||
        "";

      if (!mime.startsWith("image/"))
        return sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Eso no es una imagen.*",
        });

      let buffer = await sock.downloadMediaMessage({
        message: quoted,
      });

      if (!buffer) return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ No pude descargar la imagen.",
      });

      let apiKey = "6d3b9f27859e88c0c7f387672d2dd4c9";

      await sock.sendMessage(msg.key.remoteJid, {
        text: "⏳ Subiendo imagen a imgbb...",
      });

      let form = new FormData();
      form.append("key", apiKey);
      form.append("image", buffer.toString("base64"));

      let res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: form,
      });

      let json = await res.json();

      if (!json.success) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "❌ Error:\n" + JSON.stringify(json, null, 2),
        });
      }

      let url = json.data.url;

      await sock.sendMessage(msg.key.remoteJid, {
        text: `✅ *URL lista:*\n${url}`,
      });
    } catch (err) {
      console.log(err);
      sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Ocurrió un error subiendo la imagen.",
      });
    }
  },
};
