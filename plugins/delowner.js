import { removeOwner, isOwner } from "../utils/ownerState.js";

export default {
  commands: ["delowner"],
  private: true,

  async run(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isOwner(sender)) {
      return sock.sendMessage(sender, {
        text: "⛔ No eres owner del bot"
      });
    }

    const target =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target) {
      return sock.sendMessage(sender, {
        text: "Uso: .delowner @usuario"
      });
    }

    const removed = removeOwner(target);

    await sock.sendMessage(sender, {
      text: removed
        ? `❌ @${target.split("@")[0]} ya no es OWNER`
        : "⚠️ Ese usuario no era owner",
      mentions: [target]
    });
  }
};
