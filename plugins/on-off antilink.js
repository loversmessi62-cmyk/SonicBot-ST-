import { enableAntilink, disableAntilink } from "../utils/antilinkState.js";

export default {
  commands: ["antilink"],
  admin: true,

  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;

    if (!ctx.isGroup) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando solo funciona en grupos."
      });
    }

    const option = args[0];

    if (option === "on") {
      enableAntilink(jid);
      return sock.sendMessage(jid, {
        text: "🔒 *Antilink activado*"
      });
    }

    if (option === "off") {
      disableAntilink(jid);
      return sock.sendMessage(jid, {
        text: "🔓 *Antilink desactivado*"
      });
    }

    return sock.sendMessage(jid, {
      text: "📌 Uso:\n*.antilink on*\n*.antilink off*"
    });
  }
};
