export default {
  commands: ["promote", "admin"],
  category: "admin",
  admin: true,
  description: "Da admin a uno o varios usuarios.",

  async run(sock, msg) {
    const jid = msg.key.remoteJid;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;

    let targets = [];

    // 🧷 responder a alguien
    if (ctx?.participant) {
      targets.push(ctx.participant);
    }

    // 🧷 menciones
    if (ctx?.mentionedJid?.length) {
      targets.push(...ctx.mentionedJid);
    }

    // quitar duplicados
    targets = [...new Set(targets)];

    if (!targets.length) {
      return sock.sendMessage(
        jid,
        { text: "❌ Responde o menciona a uno o más usuarios." },
        { quoted: msg }
      );
    }

    // promover
    await sock.groupParticipantsUpdate(jid, targets, "promote");

    const mentionsText = targets
      .map(u => `@${u.split("@")[0]}`)
      .join(" ");

    // 🧠 texto dinámico
    const text =
      targets.length === 1
        ? `👑 ${mentionsText}\n🎮 Jugó con Adri y obtuvo poderes 🤤`
        : `👑 ${mentionsText}\n🎮 Jugaron con Adri y obtuvieron poderes 🤤`;

    await sock.sendMessage(
      jid,
      {
        text,
        mentions: targets
      },
      { quoted: msg }
    );
  }
};
