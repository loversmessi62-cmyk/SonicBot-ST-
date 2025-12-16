import { setByeText } from "../utils/welcomeState.js";

export default {
  commands: ["setbye"],
  admin: true,
  group: true,

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return sock.sendMessage(jid, {
        text: "✏️ Uso: .setbye texto"
      });
    }

    setByeText(jid, text);

    await sock.sendMessage(jid, {
      text: "✅ Texto de bye actualizado"
    });
  }
};
