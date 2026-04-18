import { muteUser } from "../utils/muteState.js";

function normalize(id) {
  return id
    ?.toString()
    .replace(/@s\.whatsapp\.net|@lid/g, "")
    .replace(/:\d+/g, "")
    .replace(/\D/g, "");
}

export default {
  commands: ["mute"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const context = msg.message?.extendedTextMessage?.contextInfo || {};

    let target =
      context.mentionedJid?.[0] ||
      context.participant;

    if (!target) {
      return sock.sendMessage(ctx.jid, {
        text: "❌ Responde o menciona al usuario."
      }, { quoted: msg });
    }

    muteUser(ctx.jid, normalize(target));

    await sock.sendMessage(ctx.jid, {
      text: `🔇 Usuario muteado:\n@${normalize(target)}`,
      mentions: [target]
    }, { quoted: msg });
  }
};