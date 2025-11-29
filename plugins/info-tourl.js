import axios from "axios";
import { writeFile } from "fs/promises";

const handler = async (m, { conn, args }) => {
  try {
    // Si no hay imagen ni URL
    if (!m.quoted && !args[0]) {
      return m.reply("📌 *Envía una imagen o responde a una imagen con:*\n.tourl");
    }

    // -------- DESCARGAR ARCHIVO --------
    let media;

    if (m.quoted) {
      // Si está respondiendo a una imagen
      const mime = m.quoted.mimetype || "";
      if (!mime.includes("image")) return m.reply("⚠️ Responde a una imagen válida.");
      media = await m.quoted.download();
    } else if (args[0]) {
      // Si mandó una URL directa
      return m.reply(`🔗 *LINK OBTENIDO:*\n${args[0]}`);
    }

    // Guardar temporalmente
    const file = `/tmp/${Date.now()}.jpg`;
    await writeFile(file, media);

    // SUBIR AUTOMÁTICAMENTE A IMGBB (LINK CORTO)
    const apiKey = "6a3dfe8b07b19e969f4cc9c2dfddc23f"; // API pública de imágenes gratis
    const upload = await axios.post(
      "https://api.imgbb.com/1/upload",
      {
        key: apiKey,
        image: media.toString("base64"),
      }
    );

    const url = upload.data.data.url;

    // Responder con link corto
    m.reply(`🔗 *LINK OBTENIDO:*\n${url}`);

  } catch (e) {
    console.log(e);
    m.reply("❌ Error al convertir imagen. Intenta con otra o reenvía.");
  }
};

handler.help = ["tourl"];
handler.tags = ["tools"];
handler.command = ["tourl"];

export default handler;
