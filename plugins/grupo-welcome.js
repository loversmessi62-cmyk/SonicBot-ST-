import { setWelcome } from "../utils/welcomeState.js";

export default {
  commands: ["welcome"],
  admin: true,
  group: true,

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    if (!args[0]) {
      return sock.sendMessage(jid, {
        text: "⚙️ Uso: .welcome on | off"
      });
    }

    const state = args[0].toLowerCase() === "on";
    setWelcome(jid, state);

    await sock.sendMessage(jid, {
      text: `✅ Welcome ${state ? "ACTIVADO" : "DESACTIVADO"}`
    });
  }
};
