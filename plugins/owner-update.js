import { exec } from "child_process";
import fs from "fs";
import config from "../config.js";

export default {
  commands: ["update", "upd"],
  category: "owner",
  admin: false,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    // 🔒 SOLO OWNER
    const senderNumber = ctx.sender.split("@")[0];
    if (!config.owners.includes(senderNumber)) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando es exclusivo del OWNER."
      });
    }

    await sock.sendMessage(jid, {
      text: "⏳ *Buscando actualizaciones...*"
    });

    exec("git pull", async (err, stdout, stderr) => {
      if (err) {
        return sock.sendMessage(jid, {
          text: "❌ Error en git pull:\n```" + err.message + "```"
        });
      }

      // 🧠 Si no hubo cambios
      if (/Already up to date/i.test(stdout)) {
        return sock.sendMessage(jid, {
          text: "✅ El bot ya está actualizado.\nNo fue necesario reiniciar."
        });
      }

      // Guardar info para aviso post-update
      fs.writeFileSync(
        "./restart.json",
        JSON.stringify({
          jid,
          by: senderNumber,
          at: Date.now()
        })
      );

      let message =
        "✅ *Actualización aplicada*\n\n```" +
        stdout +
        "```";

      if (stderr) {
        message += "\n⚠️ Advertencias:\n```" + stderr + "```";
      }

      message += "\n\n♻️ *Reiniciando bot...*";

      await sock.sendMessage(jid, { text: message });

      setTimeout(() => process.exit(0), 2000);
    });
  }
};