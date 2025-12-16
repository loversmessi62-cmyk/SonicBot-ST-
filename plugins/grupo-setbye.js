import { setByeText } from "../utils/welcomeState.js";

export default {
  commands: ["setbye"],
  admin: true,
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const { jid, isGroup } = ctx;
    if (!isGroup) return sock.sendMessage(jid, { text: "❌ Solo en grupos" });

    const text = args.join(" ");
    if (!text)
      return sock.sendMessage(jid, {
        text: "Uso: .setbye texto\nUsa @user @group @members"
      });

    setByeText(jid, text);

    sock.sendMessage(jid, { text: "✅ Mensaje de despedida actualizado" });
  }
};
