import axios from "axios";

let handler = async (m, { conn }) => {
  try {
    // Verificar si hay imagen
    if (!m.quoted || !m.quoted.fileSha256) {
      return m.reply("📸 *Responde a una imagen para subirla a ImgBB.*");
    }

    // Descargar imagen
    let media = await m.quoted.download();
    let api = "6d3b9f27859e88c0c7f387672d2dd4c9"; // tu API key

    // Subir imagen a ImgBB
    let form = new FormData();
    form.append("image", media.toString("base64"));

    let upload = await axios.post(`https://api.imgbb.com/1/upload?key=${api}`, form, {
      headers: form.getHeaders(),
    });

    let link = upload.data.data.url;

    await m.reply(`✅ *Imagen subida con éxito*\n🔗 *Link:* ${link}`);

  } catch (e) {
    console.log(e);
    m.reply("❌ Hubo un error subiendo la imagen.");
  }
};

handler.help = ["tourl"];
handler.tags = ["tools"];
handler.command = ["tourl", "imgbb", "uplink"];

export default handler;
