import { setWelcomeText } from "../utils/welcomeState.js";

export default {
  commands: ["setwelcome"],
  admin: true,
  group: true,

  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return sock.sendMessage(jid, {
        text: "✏️ Uso: .setwelcome texto"
      });
    }

    setWelcomeText(jid, text);

    await sock.sendMessage(jid, {
      text: "✅ Texto de welcome actualizado"
    });
  }
};
