import { exec } from "child_process";
import config from "../config.js";

function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject({
          err,
          stdout: stdout || "",
          stderr: stderr || ""
        });
      }

      resolve({
        stdout: stdout || "",
        stderr: stderr || ""
      });
    });
  });
}

export default {
  commands: ["update", "upd"],
  category: "owner",
  admin: false,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;
    const senderNumber = ctx.sender.split("@")[0];

    if (!config.owners.includes(senderNumber)) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando es exclusivo del OWNER."
      });
    }

    await sock.sendMessage(jid, {
      text: "⏳ *Buscando actualizaciones...*"
    });

    try {
      const before = await execAsync("git rev-parse HEAD");
      const pull = await execAsync("git pull");
      const after = await execAsync("git rev-parse HEAD");

      if (before.stdout.trim() === after.stdout.trim()) {
        return sock.sendMessage(jid, {
          text: "✅ El bot ya está actualizado.\nNo fue necesario recargar."
        });
      }

      let text =
        "✅ *Actualización descargada*\n\n```" +
        pull.stdout.trim() +
        "```";

      if (pull.stderr.trim()) {
        text += "\n\n⚠️ Advertencias:\n```" + pull.stderr.trim() + "```";
      }

      await sock.sendMessage(jid, {
        text: text + "\n\n♻️ *Aplicando recarga en caliente...*"
      });

      const reloaded =
        (await global.hotReload?.()) ||
        (await ctx.reloadPlugins?.());

      if (reloaded) {
        return sock.sendMessage(jid, {
          text: "✅ *Actualización aplicada sin reiniciar el bot.*"
        });
      }

      return sock.sendMessage(jid, {
        text: "⚠️ La actualización se descargó, pero no se pudo recargar.\nReinicia manualmente si notas cambios que no se aplicaron."
      });
    } catch (e) {
      const errText =
        e?.err?.message ||
        e?.stderr ||
        e?.stdout ||
        e?.message ||
        "Error desconocido";

      return sock.sendMessage(jid, {
        text: "❌ Error al actualizar:\n```" + String(errText).trim() + "```"
      });
    }
  }
};