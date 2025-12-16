import { setWelcomeText } from "../utils/welcomeState.js";

export default {
  commands: ["setwelcome"],
  admin: true,
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const { jid, isGroup } = ctx;
    if (!isGroup) return sock.sendMessage(jid, { text: "❌ Solo en grupos" });

    const text = args.join(" ");
    if (!text)
      return sock.sendMessage(jid, {
        text: "Uso: .setwelcome texto\nUsa @user @group @members"
      });

    setWelcomeText(jid, text);

    sock.sendMessage(jid, { text: "✅ Mensaje de bienvenida actualizado" });
  }
};
