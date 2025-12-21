import { isModoAdminsEnabled, setModoAdmins } from "../lib/modoadminsState.js";

export default {
  commands: ["modoadmins"],
  admin: true,
  category: "admin",

  async run(sock, msg, args, ctx) {
    const { jid } = ctx;

    const option = args[0]?.toLowerCase();

    if (!option || !["on", "off"].includes(option)) {
      return sock.sendMessage(jid, {
        text: `⚙️ Uso correcto:\n\n.modoadmins on\n.modoadmins off`
      });
    }

    if (option === "on") {
      setModoAdmins(true);
      return sock.sendMessage(jid, {
        text: "🔒 *Modo Admin ACTIVADO*\nSolo admins pueden usar el bot."
      });
    }

    if (option === "off") {
      setModoAdmins(false);
      return sock.sendMessage(jid, {
        text: "🔓 *Modo Admin DESACTIVADO*\nTodos pueden usar el bot."
      });
    }
  }
};