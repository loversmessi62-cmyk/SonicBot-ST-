export default {
  commands: ["todos", "tagall"],
  admin: true,
  category: "admin",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    if (!ctx.isGroup) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando solo funciona en grupos."
      });
    }

    // ✅ PARTICIPANTES EN TIEMPO REAL (SIN BUG)
    const participants = ctx.participants || [];
    if (!participants.length) {
      return sock.sendMessage(jid, {
        text: "⚠️ No pude obtener los participantes del grupo."
      });
    }

    const groupName = ctx.groupMetadata?.subject || "este grupo";

    // 🔥 UN SOLO EMOJI
    const emoji = "🔥";

    // ✅ MENTIONS LIMPIAS (LID + NUM)
    const mentions = participants.map(p => p.id);

    // 🧠 TEXTO PRO
    const text =
      `📢 *MENCIÓN GENERAL — ${groupName}*\n\n` +
      participants.map(p => `${emoji} @${p.id.split("@")[0]}`).join("\n");

    // 📤 ENVIAR MENSAJE
    await sock.sendMessage(jid, {
      text,
      mentions
    });

    // 🔁 REACCIONAR AL COMANDO .TODOS
    await sock.sendMessage(jid, {
      react: {
        text: "🔥",
        key: msg.key
      }
    });
  }
};
