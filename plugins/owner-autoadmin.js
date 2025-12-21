import config from "../config.js";

export default {
  commands: ["autoadmin"],
  category: "owner",
  admin: false,

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

    // 🔎 VERIFICAR ADMIN REAL DEL BOT (ANTI-BUG LID)
    let botIsAdmin = false;
    try {
      const metadata = await sock.groupMetadata(jid);
      const botJid = sock.user.id.split(":")[0];

      botIsAdmin = metadata.participants.some(
        p =>
          (p.id?.split(":")[0] === botJid ||
            p.jid?.split(":")[0] === botJid) &&
          (p.admin === "admin" || p.admin === "superadmin")
      );
    } catch (e) {
      console.error("❌ Error verificando admin real:", e);
    }

    if (!botIsAdmin) {
      return sock.sendMessage(jid, {
        text: "❌ El bot NO es administrador del grupo."
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
