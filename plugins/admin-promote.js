export default {
  commands: ["promote", "admin"],
  category: "admin",
  admin: true,
  description: "Da admin a uno o varios usuarios.",

  async run(sock, msg) {
    const jid = msg.key?.remoteJid || msg.chat;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;

    // validar grupo
    if (!jid || !jid.endsWith("@g.us")) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando solo funciona en grupos."
      }, { quoted: msg });
    }

    let targets = [];

    // responder
    if (ctx?.participant) {
      targets.push(ctx.participant);
    }

    // menciones
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
    try {
      await sock.groupParticipantsUpdate(jid, targets, "promote");
    } catch (e) {
      return sock.sendMessage(jid, {
        text: "❌ No pude promover (¿soy admin?)"
      }, { quoted: msg });
    }

    const mentionsText = targets
      .map(u => `@${u.split("@")[0]}`)
      .join(" ");

    // 🔥 SOLO UN TEXTO
    const text = `👑 ${mentionsText}\n Se la chupo a Orlando157 y obtuvo poderes 🤤`;

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