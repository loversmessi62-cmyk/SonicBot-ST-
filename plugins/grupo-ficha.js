import fs from "fs";
import path from "path";

const DATA_DIR = "./data";
const FILE = path.join(DATA_DIR, "fichas.json");

// Crear carpeta si no existe
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Crear archivo si no existe
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");

const load = () => JSON.parse(fs.readFileSync(FILE));
const save = (data) =>
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

export default {
  commands: ["ficha", "setficha"],
  admin: false, // lo controlamos manualmente
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const { jid, isGroup, isAdmin } = ctx;
    const data = load();

    // ===============================
    // 📌 .setficha
    // ===============================
    if (ctx.args[0] && ctx.msg.message && ctx.msg.message.conversation) {}

    if (msg.message?.conversation?.startsWith(".setficha") ||
        msg.message?.extendedTextMessage?.text?.startsWith(".setficha")) {

      if (!isGroup)
        return sock.sendMessage(jid, {
          text: "❌ Este comando solo funciona en grupos."
        });

      if (!isAdmin)
        return sock.sendMessage(jid, {
          text: "❌ Solo administradores pueden usar este comando."
        });

      const text = args.join(" ").trim();

      if (!text)
        return sock.sendMessage(jid, {
          text: "✏️ Uso correcto:\n.setficha <texto de la ficha>"
        });

      data[jid] = text;
      save(data);

      return sock.sendMessage(jid, {
        text: "✅ *Ficha guardada correctamente*"
      });
    }

    // ===============================
    // 📌 .ficha
    // ===============================
    if (!data[jid]) {
      return sock.sendMessage(jid, {
        text: "📄 *No hay ficha configurada en este grupo.*\nUsa `.setficha` para crear una."
      });
    }

    return sock.sendMessage(jid, {
      text: `📌 *FICHA DEL GRUPO*\n\n${data[jid]}`
    });
  }
};