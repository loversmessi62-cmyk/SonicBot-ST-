import fs from "fs";
import config from "../config.js";
import { isOwner } from "../utils/isOwner.js";

export default {
  commands: ["delowner"],
  private: true,

  async run(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isOwner(sender)) {
      return sock.sendMessage(sender, {
        text: "⛔ Solo el OWNER principal puede usar esto"
      });
    }

    const target =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target) {
      return sock.sendMessage(sender, {
        text: "Uso: .delowner @usuario"
      });
    }

    const number = target.split("@")[0];

    if (!config.owners.includes(number)) {
      return sock.sendMessage(sender, {
        text: "⚠️ Ese usuario no es owner"
      });
    }

    config.owners = config.owners.filter(o => o !== number);

    fs.writeFileSync(
      "./config.js",
      `export default ${JSON.stringify(config, null, 2)};\n`
    );

    await sock.sendMessage(sender, {
      text: `❌ @${number} ya no es OWNER`,
      mentions: [target]
    });
  }
};
