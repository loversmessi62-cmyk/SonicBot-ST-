import { isModoAdminsEnabled, setModoAdmins } from "../lib/modoadminsState.js";

export default {
  commands: ["modoadmins"],
  category: "admin",
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, isAdmin } = ctx;

    // 🛑 ESTA es la clave
    if (!isAdmin) return;

    const option = args[0]?.toLowerCase();

    if (!option || !["on", "off"].includes(option)) {
      return sock.sendMessage(jid, {
        text: "⚙️ Uso:\n.modoadmins on\n.modoadmins off"
      });
    }

    if (option === "on") {
      setModoAdmins(true);
      return sock.sendMessage(jid, {
        text: "🔒 *Modo Admin ACTIVADO*"
      });
    }

    if (option === "off") {
      setModoAdmins(false);
      return sock.sendMessage(jid, {
        text: "🔓 *Modo Admin DESACTIVADO*"
      });
    }
  }
};