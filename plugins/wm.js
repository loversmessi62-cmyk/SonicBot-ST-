import { Sticker, StickerTypes } from "wa-sticker-formatter";

module.exports = {
  commands: ["wm", "take", "robar"],
  category: "tools",

  async run(conn, m, args) {
    if (!m.quoted) return conn.reply(m.chat, "⚠️ Responde a un sticker.", m);

    const text = args.join(" ").trim();
    if (!text) return conn.reply(m.chat, "⚠️ Usa: wm Pack | Autor", m);

    const q = m.quoted;
    if (q.mimetype !== "image/webp")
      return conn.reply(m.chat, "⚠️ El mensaje citado no es un sticker.", m);

    const [pack = "Sticker Pack", author = "WM"] =
      text.split(/[|•]/).map(v => v.trim());

    try {
      const buffer = await conn.downloadMediaMessage(q);

      const sticker = new Sticker(buffer, {
        pack,
        author,
        type: StickerTypes.FULL,
        quality: 80
      });

      await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m });
    } catch (e) {
      console.error(e);
      conn.reply(m.chat, "❌ Error al modificar el sticker.", m);
    }
  }
};