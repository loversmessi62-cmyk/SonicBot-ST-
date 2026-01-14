import config from "../config.js";

export default {
  commands: ["autoadmin"],
  category: "owner",
  admin: false,
  description: "Se promueve automáticamente como admin si eres owner.",
  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;
    const senderNumber = ctx.sender.split("@")[0];

    if (!config.owners.includes(senderNumber)) {
      return sock.sendMessage(jid, { text: "❌ Este comando es exclusivo del OWNER." });
    }

    if (!ctx.isGroup) {
      return sock.sendMessage(jid, { text: config.messages.group });
    }

    let metadata;
    try {
      metadata = await sock.groupMetadata(jid);
    } catch {
      return sock.sendMessage(jid, { text: "❌ No pude obtener información del grupo." });
    }

    const botParticipant = metadata.participants.find(p => p.id === sock.user.id);

    if (!botParticipant || !botParticipant.admin) {
      return sock.sendMessage(jid, { text: "❌ El bot NO es administrador del grupo." });
    }

    const target = msg.key.participant || ctx.sender;

    try {
      await sock.groupParticipantsUpdate(jid, [target], "promote");
      await sock.sendMessage(jid, { text: "🔥 *Listo.*\nAhora eres administrador del grupo." });
    } catch (e) {
      console.error("❌ Error autoadmin:", e);
      await sock.sendMessage(jid, {
        text:
          "❌ WhatsApp rechazó la promoción.\n\n" +
          "📌 Esto suele pasar cuando:\n" +
          "• El bot perdió permisos\n" +
          "• El grupo es muy reciente"
      });
    }
  }
};