import { exec } from "child_process";

export default {
  commands: ["update", "upd"],
  category: "owner",
  admin: true,

  run: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    await sock.sendMessage(jid, {
      text: "⏳ *Actualizando bot desde GitHub...*\nNo apagues nada."
    });

    exec("git pull", async (err, stdout, stderr) => {
      if (err) {
        return sock.sendMessage(jid, {
          text: "❌ *Error en git pull:*\n```" + err.message + "```"
        });
      }

      let text = "✅ *Actualización completada*\n\n```" + stdout + "```";

      if (stderr) {
        text += "\n⚠️ *Advertencias:*\n```" + stderr + "```";
      }

      text += "\n\n♻️ *Reiniciando bot automáticamente...*";

      await sock.sendMessage(jid, { text });

      // ⏳ Pequeño delay para que el mensaje sí se envíe
      setTimeout(() => {
        console.log("♻️ Reinicio solicitado por .update");
        process.exit(0); // 🔥 EL HOST LO LEVANTA SOLO
      }, 2000);
    });
  }
};
