import { exec } from "child_process";
import fs from "fs";

export default {
  commands: ["update", "upd"],
  category: "owner",
  admin: true,

  run: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    // Mensaje inicial
    await sock.sendMessage(jid, {
      text: "⏳ *Actualizando bot desde GitHub...*\nNo apagues nada."
    });

    exec("git pull", async (err, stdout, stderr) => {
      if (err) {
        return sock.sendMessage(jid, {
          text: "❌ *Error en git pull:*\n```" + err.message + "```"
        });
      }

      let message =
        "✅ *Actualización completada*\n\n```" +
        stdout +
        "```";

      if (stderr) {
        message += "\n⚠️ *Advertencias:*\n```" + stderr + "```";
      }

      message += "\n\n♻️ *Reiniciando bot automáticamente...*";

      await sock.sendMessage(jid, { text: message });

      // 🔥 Guardamos quién pidió el restart
      fs.writeFileSync(
        "./restart.json",
        JSON.stringify({
          jid,
          at: Date.now()
        })
      );

      // ⏳ Delay para que el mensaje salga antes del exit
      setTimeout(() => {
        console.log("♻️ Reinicio solicitado con .update");
        process.exit(0); // 👉 el HOST lo levanta solo
      }, 2000);
    });
  }
};
