import { exec } from "child_process";

export default {
  commands: ["update", "upd"],   // 👈 Compatible con tu handler
  admin: true,                   // Solo admin

  run: async (sock, msg, args, ctx) => {
    let jid = msg.key.remoteJid;

    // Mensaje inicial
    await sock.sendMessage(jid, { text: "⏳ *Actualizando desde GitHub...*\nEspere un momento..." });

    exec("git pull", async (err, stdout, stderr) => {
      if (err) {
        return sock.sendMessage(jid, {
          text: "❌ *Error ejecutando git pull:*\n" + err.message
        });
      }

      if (stderr) {
        await sock.sendMessage(jid, { text: "⚠️ Advertencias:\n" + stderr });
      }

      await sock.sendMessage(jid, {
        text:
          "✅ *Actualización completada:*\n```\n" +
          stdout +
          "\n```\n" +
          "🔄 *Reinicia el bot manualmente con:*\n```bash\nnode index.js\n```"
      });
    });
  }
};
