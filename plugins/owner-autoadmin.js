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

    let metadata;
    try {
      metadata = await sock.groupMetadata(jid);
    } catch {
      return sock.sendMessage(jid, {
        text: "❌ No pude obtener información del grupo."
      });
    }

    // 🔎 VERIFICAR BOT ADMIN (REAL)
    const botBase = sock.user.id.split(":")[0];
    const botParticipant = metadata.participants.find(p =>
      p.id?.split(":")[0] === botBase
    );

    if (!botParticipant || !botParticipant.admin) {
      return sock.sendMessage(jid, {
        text: "❌ El bot NO es administrador del grupo."
      });
    }

    // 🔥 BUSCAR PARTICIPANTE REAL DEL OWNER (LID > JID)
    const ownerParticipant = metadata.participants.find(p =>
      p.id === ctx.sender ||
      p.jid === ctx.sender ||
      p.id?.startsWith(ctx.sender.split("@")[0])
    );

    if (!ownerParticipant) {
      return sock.sendMessage(jid, {
        text: "❌ No pude encontrarte en el grupo."
      });
    }

    // 🔥 USAR EL ID REAL (LID SI EXISTE)
    const targetId = ownerParticipant.id;

    // ✅ YA ES ADMIN
    if (ownerParticipant.admin) {
      return sock.sendMessage(jid, {
        text: "✅ Ya eres administrador del grupo."
      });
    }

    // 🚀 PROMOVER
    try {
      await sock.groupParticipantsUpdate(
        jid,
        [targetId],
        "promote"
      );

      await sock.sendMessage(jid, {
        text: "🔥 *Listo.*\nAhora eres administrador del grupo."
      });

    } catch (e) {
      console.error("❌ Error autoadmin:", e);

      await sock.sendMessage(jid, {
        text:
          "❌ WhatsApp rechazó la promoción.\n\n" +
          "📌 Esto suele pasar cuando:\n" +
          "• El grupo usa LID\n" +
          "• El bot perdió permisos\n" +
          "• El grupo es muy reciente"
      });
    }
  }
};
