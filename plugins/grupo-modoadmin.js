import { isModoAdminsEnabled, setModoAdmins } from "../lib/modoadminsState.js";

export default {
  commands: ["modoadmins"],
  category: "admin",
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, isAdmin } = ctx;

    if (!isAdmin) {
      return sock.sendMessage(jid, {
        text: "❌ Solo administradores pueden usar este comando."
      });
    }

    const option = args[0]?.toLowerCase();

    if (!["on", "off"].includes(option)) {
      return sock.sendMessage(jid, {
        text: "⚙️ Uso:\n.modoadmins on\n.modoadmins off"
      });
    }

    if (option === "on") {
      setModoAdmins(jid, true);
      return sock.sendMessage(jid, {
        text: "🔒 *Modo Admins ACTIVADO para este grupo*"
      });
    }

    if (option === "off") {
      setModoAdmins(jid, false);
      return sock.sendMessage(jid, {
        text: "🔓 *Modo Admins DESACTIVADO para este grupo*"
      });
    }
  }
};