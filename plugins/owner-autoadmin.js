import { ownerNumber } from "../config.js";

export default {
  commands: ["autoadmin"],
  category: "owner",
  admin: false, // ❌ no admins, solo owner

  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;

    // 🔒 SOLO OWNER
    const senderNumber = ctx.sender.split("@")[0];
    if (senderNumber !== ownerNumber) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando es exclusivo del OWNER."
      });
    }

    // ❌ Solo grupos
    if (!ctx.isGroup) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando solo funciona en grupos."
      });
    }

    // ✅ Ya es admin
    if (ctx.isBotAdmin) {
      return sock.sendMessage(jid, {
        text: "✅ Ya soy administrador en este grupo 😎"
      });
    }

    const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    try {
      await sock.groupParticipantsUpdate(
        jid,
        [botJid],
        "promote"
      );

      await sock.sendMessage(jid, {
        text: "🔥 *Listo.*\nAhora soy administrador del grupo."
      });

    } catch (e) {
      console.error("❌ Error autoadmin:", e);

      await sock.sendMessage(jid, {
        text:
          "❌ No pude darme admin.\n\n" +
          "📌 *Posibles razones:*\n" +
          "• Tú no eres admin del grupo\n" +
          "• El grupo no permite promociones\n" +
          "• WhatsApp bloqueó la acción"
      });
    }
  }
};
