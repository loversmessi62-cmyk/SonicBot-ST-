import { exec } from "child_process";
import fs from "fs";
import config from "../config.js";

export default {
  commands: ["update", "upd"],
  category: "owner",
  admin: false,

  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;

    // 🔒 SOLO OWNER
    const senderNumber = ctx.sender.split("@")[0];
    if (!config.owners.includes(senderNumber)) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando es exclusivo del OWNER."
      });
    }

    await sock.sendMessage(jid, {
      text: "⏳ *Actualizando bot desde GitHub...*\nNo apagues nada."
    });

    exec("git pull", async (err, stdout, stderr) => {
      if (err) {
        return sock.sendMessage(jid, {
          text: "❌ Error en git pull:\n```" + err.message + "```"
        });
      }

      let message =
        "✅ *Actualización completada*\n\n```" +
        stdout +
        "```";

      if (stderr) {
        message += "\n⚠️ Advertencias:\n```" + stderr + "```";
      }

      message += "\n\n♻️ *Reiniciando bot automáticamente...*";

      await sock.sendMessage(jid, { text: message });

      fs.writeFileSync(
        "./restart.json",
        JSON.stringify({ jid, at: Date.now() })
      );

      setTimeout(() => {
        process.exit(0);
      }, 2000);
    });
  }
};
