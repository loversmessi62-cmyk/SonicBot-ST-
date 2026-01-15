import fs from "fs";
import path from "path";
import { downloadContentFromMessage, writeExifSticker } from "@whiskeysockets/baileys";

export default {
  commands: ["wm"],
  category: "sticker",
  description: "Agrega un watermark (texto) a un sticker citado",

  async run(sock, msg, args, ctx) {
    try {
      const jid = ctx.jid;

      // Texto a poner en el sticker
      const text = args.join(" ").trim();
      if (!text) {
        return sock.sendMessage(
          jid,
          { text: "❌ Usa: *.wm texto*\nEjemplo: .wm adri" },
          { quoted: msg }
        );
      }

      // Obtener mensaje citado
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.stickerMessage) {
        return sock.sendMessage(
          jid,
          { text: "❌ Responde a un *sticker*" },
          { quoted: msg }
        );
      }

      // Carpeta temporal
      const tmp = "./tmp";
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

      const inputPath = path.join(tmp, `${Date.now()}.webp`);
      const outputPath = path.join(tmp, `${Date.now()}_wm.webp`);

      // ⬇️ Descargar sticker
      const stream = await downloadContentFromMessage(quoted.stickerMessage, "sticker");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      fs.writeFileSync(inputPath, buffer);

      console.log("✅ Sticker descargado correctamente");

      // ✍️ Agregar watermark
      const stickerBuffer = await writeExifSticker(
        { sticker: fs.readFileSync(inputPath) },
        { packname: "", author: text }
      );

      fs.writeFileSync(outputPath, stickerBuffer);

      console.log("✅ Watermark agregado:", text);

      // 📤 Enviar sticker con watermark
      await sock.sendMessage(
        jid,
        { sticker: fs.readFileSync(outputPath) },
        { quoted: msg }
      );

      // Limpiar archivos temporales
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      console.log("✅ Sticker enviado y archivos temporales eliminados");
    } catch (err) {
      console.error("❌ Error en comando .wm:", err);
      return sock.sendMessage(
        ctx.jid,
        { text: "❌ Ocurrió un error al procesar el sticker" },
        { quoted: msg }
      );
    }
  }
};
