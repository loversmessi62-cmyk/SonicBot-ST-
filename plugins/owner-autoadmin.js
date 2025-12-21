import config from "../config.js";

export default {
  commands: ["autoadmin"],
  category: "owner",
  admin: false, // ❌ no admins, solo owner

  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;

    // 🔒 SOLO OWNER
    const senderNumber = ctx.sender.split("@")[0];
    if (!config.owners.includes(senderNumber)) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando es exclusivo del OWNER."
      });
    }

    // ❌ Solo grupos
    if (!ctx.isGroup) {
      return sock.sendMessage(jid, {
        text: config.messages.group
      });
    }

    // ❌ El bot no es admin
    if (!ctx.isBotAdmin) {
      return sock.sendMessage(jid, {
        text: "❌ El bot no es administrador del grupo."
      });
    }

    // 🔥 PROMOVER AL OWNER (TÚ)
    try {
      await sock.groupParticipantsUpdate(
        jid,
        [ctx.sender],
        "promote"
      );

      await sock.sendMessage(jid, {
        text: "🔥 *Listo.*\nAhora eres administrador del grupo."
      });

    } catch (e) {
      console.error("❌ Error autoadmin:", e);

      await sock.sendMessage(jid, {
        text:
          "❌ No pude darte admin.\n\n" +
          "📌 Posibles razones:\n" +
          "• Ya eres admin\n" +
          "• WhatsApp bloqueó la acción\n" +
          "• El grupo no permite promociones"
      });
    }
  }
};
