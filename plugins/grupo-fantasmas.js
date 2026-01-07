export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, store, isBotAdmin, groupAdmins, command } = ctx;

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    // admins normalizados
    const adminIds = groupAdmins.map(a =>
      a.id.replace(/@s\.whatsapp\.net|@lid/g, "").replace(/:\d+/g, "")
    );

    // 👻 fantasmas = nunca enviaron texto
    const fantasmas = participants.filter(p => {
      const id = p.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "");

      if (adminIds.includes(id)) return false;
      if (chat[id]) return false;

      return true;
    });

    // =========================
    // 👻 .fantasmas
    // =========================
    if (command === "fantasmas") {
      if (!fantasmas.length) {
        return sock.sendMessage(jid, {
          text:
            "✨ No se detectaron fantasmas.\n\n" +
            "⚠️ *Aviso:* WhatsApp solo permite detectar\n" +
            "mensajes de texto o captions.\n" +
            "Stickers, audios y reacciones no cuentan."
        });
      }

      return sock.sendMessage(jid, {
        text:
          "🕯️ *POSIBLES FANTASMAS DEL GRUPO*\n\n" +
          "⚠️ Este listado *NO es 100% exacto*.\n" +
          "Solo se muestran usuarios que *nunca enviaron texto*\n" +
          "desde que el bot está en el grupo.\n\n" +
          fantasmas.map(u => `👻 @${u.id.split("@")[0]}`).join("\n") +
          "\n\n🗑️ Para expulsarlos usa:\n👉 *.kickfantasmas*",
        mentions: fantasmas.map(u => u.id)
      });
    }

    // =========================
    // 🗑️ .kickfantasmas
    // =========================
    if (command === "kickfantasmas") {
      if (!isBotAdmin)
        return sock.sendMessage(jid, {
          text: "❌ Necesito ser administrador para expulsarlos."
        });

      if (!fantasmas.length)
        return sock.sendMessage(jid, {
          text: "✨ No hay fantasmas para expulsar."
        });

      const ids = fantasmas.map(u => u.id);

      await sock.sendMessage(jid, {
        text:
          "🗑️ *Expulsando fantasmas*\n\n" +
          ids.map(x => `👻 @${x.split("@")[0]}`).join("\n"),
        mentions: ids
      });

      await sock.groupParticipantsUpdate(jid, ids, "remove");
    }
  }
};
