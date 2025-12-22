import fs from "fs";
import path from "path";

const DATA_DIR = "./data";
const FILE = path.join(DATA_DIR, "fichas.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");

const load = () => JSON.parse(fs.readFileSync(FILE));
const save = (data) =>
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

export default {
  commands: ["ficha", "setficha", "delficha"],
  admin: false,

  async run(sock, msg, args, ctx) {
    const { jid, isGroup, isAdmin } = ctx;
    const data = load();

    // ===============================
    // 📌 SETFICHA (CREA / REEMPLAZA)
    // ===============================
    if (ctx.command === "setficha") {

      if (!isGroup)
        return sock.sendMessage(jid, { text: "❌ Solo funciona en grupos." });

      if (!isAdmin)
        return sock.sendMessage(jid, {
          text: "❌ Solo administradores pueden usar este comando."
        });

      const text =
        msg.message?.conversation?.replace(/^\.setficha\s*/i, "") ||
        msg.message?.extendedTextMessage?.text?.replace(/^\.setficha\s*/i, "");

      if (!text || !text.trim())
        return sock.sendMessage(jid, {
          text: "✏️ Escribe la ficha después del comando."
        });

      // 🔥 SOBREESCRIBE SIN PREGUNTAR
      data[jid] = text;
      save(data);

      return sock.sendMessage(jid, {
        text: "✅ *Ficha guardada / actualizada correctamente*"
      });
    }

    // ===============================
    // 🗑️ DELFICHA (ELIMINAR)
    // ===============================
    if (ctx.command === "delficha") {

      if (!isGroup)
        return sock.sendMessage(jid, { text: "❌ Solo funciona en grupos." });

      if (!isAdmin)
        return sock.sendMessage(jid, {
          text: "❌ Solo administradores pueden usar este comando."
        });

      if (!data[jid]) {
        return sock.sendMessage(jid, {
          text: "📄 No hay ninguna ficha para eliminar."
        });
      }

      delete data[jid];
      save(data);

      return sock.sendMessage(jid, {
        text: "🗑️ *Ficha eliminada correctamente*"
      });
    }

    // ===============================
    // 📌 FICHA (MOSTRAR)
    // ===============================
    if (!data[jid]) {
      return sock.sendMessage(jid, {
        text: "📄 No hay ficha configurada en este grupo."
      });
    }

    return sock.sendMessage(jid, {
      text: `📌 *FICHA DEL GRUPO*\n\n${data[jid]}`
    });
  }
};