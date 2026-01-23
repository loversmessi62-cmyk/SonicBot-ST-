import { Sticker } from "wa-sticker-formatter";

export default {
  commands: ["wm", "take", "robar"],
  category: "tools",

  async run(conn, m, args) {
    const text = args.join(" ").trim();

    if (!m.quoted)
      return conn.reply(
        m.chat,
        "⚠️ Responde a un sticker con el comando.\nEjemplo: wm Pack | Autor",
        m
      );

    const q = m.quoted;
    const mime = q.mimetype || q.msg?.mimetype || "";
    const isSticker =
      /webp/.test(mime) ||
      q.sticker ||
      q.message?.stickerMessage ||
      q.msg?.stickerMessage;

    if (!isSticker)
      return conn.reply(m.chat, "⚠️ El mensaje citado no es un sticker.", m);

    if (!text)
      return conn.reply(m.chat, "⚠️ Escribe el Pack (y opcional el Autor).", m);

    const parts = text.split(/[|•]/).map(x => x.trim()).filter(Boolean);
    const pack = parts[0] || "Sticker Pack";
    const author = parts[1] || "WM";

    if (pack.length > 50) return conn.reply(m.chat, "❌ Pack máximo 50 letras.", m);
    if (author.length > 50) return conn.reply(m.chat, "❌ Autor máximo 50 letras.", m);

    try {
      if (typeof q.download !== "function")
        return conn.reply(m.chat, "❌ Tu base no soporta m.quoted.download().", m);

      const stickerBuffer = await q.download();
      if (!stickerBuffer)
        return conn.reply(m.chat, "❌ No pude descargar el sticker citado.", m);

      const sticker = new Sticker(stickerBuffer, {
        pack,
        author,
        type: "full",
        quality: 80
      });

      const webp = await sticker.toBuffer();
      await conn.sendMessage(m.chat, { sticker: webp }, { quoted: m });
    } catch (e) {
      console.error("❌ WM ERROR:", e);
      return conn.reply(m.chat, `❌ Error al poner WM: ${e?.message || e}`, m);
    }
  }
};