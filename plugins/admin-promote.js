export default {
  commands: ["promote", "admin"],
  category: "admin",
  admin: true,
  description: "Da admin al usuario respondido o mencionado.",

  async run(sock, msg) {
    const jid = msg.key.remoteJid;

    const context = msg.message?.extendedTextMessage?.contextInfo;

    // 1️⃣ prioridad: reply
    let target = context?.participant;

    // 2️⃣ si no hay reply, usar @mención
    if (!target && context?.mentionedJid?.length) {
      target = context.mentionedJid[0];
    }

    if (!target) {
      return await sock.sendMessage(
        jid,
        { text: "❌ Responde a alguien o menciónalo con @ para promoverlo." },
        { quoted: msg }
      );
    }

    await sock.groupParticipantsUpdate(jid, [target], "promote");

    const user = `@${target.split("@")[0]}`;

    await sock.sendMessage(
      jid,
      {
        text: `👑 ${user} Se la chupo a Adri y obtuvo poderes 🤤`,
        mentions: [target]
      },
      { quoted: msg }
    );
  }
};
