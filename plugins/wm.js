import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default {
  command: ["wm", "take", "robar"],
  tags: ["tools"],
  desc: "Cambiar watermark de stickers",

  async run({ sock, msg, args }) {
    if (!msg.quoted)
      return sock.sendMessage(
        msg.chat,
        { text: "⚠️ Responde a un sticker." },
        { quoted: msg }
      );

    const text = args.join(" ").trim();
    if (!text)
      return sock.sendMessage(
        msg.chat,
        { text: "⚠️ Usa: .wm Pack | Autor" },
        { quoted: msg }
      );

    const q = msg.quoted;
    if (!q.isSticker)
      return sock.sendMessage(
        msg.chat,
        { text: "⚠️ El mensaje citado no es un sticker." },
        { quoted: msg }
      );

    const [pack = "Sticker Pack", author = "WM"] =
      (text.split(/[|•]/).map(v => v.trim())).concat(["Sticker Pack", "WM"]);

    try {
      const buffer = await q.download();

      const sticker = new Sticker(buffer, {
        pack,
        author,
        type: StickerTypes.FULL,
        quality: 80
      });

      await sock.sendMessage(
        msg.chat,
        { sticker: await sticker.toBuffer() },
        { quoted: msg }
      );
    } catch (e) {
      console.error(e);
      await sock.sendMessage(
        msg.chat,
        { text: "❌ Error al modificar el sticker." },
        { quoted: msg }
      );
    }
  }
};