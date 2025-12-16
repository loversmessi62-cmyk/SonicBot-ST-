import { setByeState } from "../utils/welcomeState.js";

export default {
  commands: ["bye"],
  admin: true,
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const { jid, isGroup } = ctx;
    if (!isGroup) return sock.sendMessage(jid, { text: "❌ Solo en grupos" });

    const option = args[0];
    if (!["on", "off"].includes(option))
      return sock.sendMessage(jid, { text: "Uso: .bye on / off" });

    setByeState(jid, option === "on");

    sock.sendMessage(jid, {
      text: `👋 Bye ${option === "on" ? "activado" : "desactivado"}`
    });
  }
};
