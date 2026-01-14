import { enableAntilink, disableAntilink, isAntilinkEnabled } from "../utils/antilinkState.js";

const anyLinkRegex = /https?:\/\/[^\s]+/i;
const groupLinkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;

export default {
  commands: ["antilink"],
  admin: true,
  category: "grupo",

  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;

    if (!ctx.isGroup) {
      return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
    }

    const option = args[0];

    if (option === "on") {
      enableAntilink(jid);
      return sock.sendMessage(jid, { text: "🔒 *Antilink activado*" });
    }

    if (option === "off") {
      disableAntilink(jid);
      return sock.sendMessage(jid, { text: "🔓 *Antilink desactivado*" });
    }

    return sock.sendMessage(jid, { text: "📌 Uso:\n*.antilink on*\n*.antilink off*" });
  }
};

export async function antilinkHandler(sock, msg, ctx) {
  const jid = msg.key.remoteJid;

  if (!ctx.isGroup) return;
  if (!msg.text) return;
  if (ctx.isAdmin) return;
  if (!isAntilinkEnabled(jid)) return;
  if (!anyLinkRegex.test(msg.text)) return;

  const offender = msg.sender;
  const offenderTag = `@${offender.split("@")[0]}`;

  await sock.sendMessage(jid, {
    text: `*《★》Enlace Detectado*\n\nLo siento, ${offenderTag}, no se permiten enlaces en este grupo. Serás expulsado.`,
    mentions: [offender]
  });

  try {
    await sock.sendMessage(jid, { delete: msg.key });
    if (ctx.isBotAdmin) {
      await sock.groupParticipantsUpdate(jid, [offender], "remove");
    } else {
      await sock.sendMessage(jid, { text: "❌ No soy admin, no puedo expulsar usuarios." });
    }
  } catch (err) {
    console.error(err);
    await sock.sendMessage(jid, { text: `🌤️ *ERROR:*\n${err.message}` });
  }
}