import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";

export default {
  commands: ["wm"],
  category: "sticker",
  description: "Renombra un sticker con un solo watermark",

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;

    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.stickerMessage) {
      return sock.sendMessage(
        jid,
        { text: "❌ Responde a un *sticker*.\nEjemplo: .wm adri" },
        { quoted: msg }
      );
    }

    const text = args.join(" ").trim();
    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "❌ Escribe algo, no seas pendejo.\nEjemplo: .wm adri" },
        { quoted: msg }
      );
    }

    const tmpDir = "./tmp";
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const file = path.join(tmpDir, `${Date.now()}.webp`);

    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      "sticker"
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    fs.writeFileSync(file, buffer);

    await sock.sendMessage(
      jid,
      {
        sticker: fs.readFileSync(file),
        packname: "",      // 👈 vacío
        author: text       // 👈 SOLO el texto
      },
      { quoted: msg }
    );

    fs.unlinkSync(file);
  }
};
