import { setWelcomeText } from "../utils/welcomeState.js";

export default {
  commands: ["setwelcome"],
  admin: true,
  group: true,

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    const text =
      msg.message?.conversation?.replace(/^\.setwelcome\s*/i, "") ||
      msg.message?.extendedTextMessage?.text?.replace(/^\.setwelcome\s*/i, "");

    if (!text || !text.trim()) {
      return sock.sendMessage(jid, {
        text:
`Uso:
.setwelcome <mensaje>

Variables disponibles:
@user @name @group @desc @id @date @time`
      });
    }

    setWelcomeText(jid, text);

    await sock.sendMessage(jid, {
      text: "✅ Welcome actualizado (con variables dinámicas)"
    });
  }
};