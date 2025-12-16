import { setWelcomeState } from "../utils/welcomeState.js";

export default {
  commands: ["welcome"],
  admin: true,
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const { jid, isGroup } = ctx;
    if (!isGroup) return sock.sendMessage(jid, { text: "❌ Solo en grupos" });

    const option = args[0];
    if (!["on", "off"].includes(option))
      return sock.sendMessage(jid, { text: "Uso: .welcome on / off" });

    setWelcomeState(jid, option === "on");

    sock.sendMessage(jid, {
      text: `👋 Welcome ${option === "on" ? "activado" : "desactivado"}`
    });
  }
};
