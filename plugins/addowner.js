import { addOwner, isOwner } from "../utils/ownerState.js";

export default {
  commands: ["addowner"],
  private: true,

  async run(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;

    // 🔒 solo owners
    if (!isOwner(sender)) {
      return sock.sendMessage(sender, {
        text: "⛔ No eres owner del bot"
      });
    }

    const target =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target) {
      return sock.sendMessage(sender, {
        text: "Uso: .addowner @usuario"
      });
    }

    const added = addOwner(target);

    await sock.sendMessage(sender, {
      text: added
        ? `✅ @${target.split("@")[0]} ahora es OWNER`
        : "⚠️ Ese usuario ya es owner",
      mentions: [target]
    });
  }
};
