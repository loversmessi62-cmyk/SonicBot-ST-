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
      return sock.sendMessage(jid, { text: "No eres ADRI, puta." });
    }

    if (!ctx.isGroup) {
      return sock.sendMessage(jid, { text: config.messages.group });
    }

    const target = msg.key.participant || ctx.sender;

    try {
      await sock.groupParticipantsUpdate(jid, [target], "promote");
      await sock.sendMessage(jid, { text: "🔥 *Listo.*\nNos vamos a robar el grupo mi amo." });
    } catch (e) {
      console.error("❌ Error autoadmin:", e);
      await sock.sendMessage(jid, {
        text:
          "❌ No pude promoverte.\n\n" +
          "📌 Esto suele pasar cuando:\n" +
          "• El bot no es admin del grupo\n" +
          "• El grupo es muy reciente\n" +
          "• WhatsApp bloqueó la acción"
      });
    }
  }
};
