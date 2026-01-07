export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      store,
      isBotAdmin,
      groupAdmins,
      command // ✅ IMPORTANTE
    } = ctx;

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    // 🛡️ admins normalizados
    const adminIds = groupAdmins.map(a =>
      a.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
    );

    // 👻 fantasmas = NUNCA hablaron
    const fantasmas = participants.filter(p => {
      const id = p.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "");

      // ❌ no admins
      if (adminIds.includes(id)) return false;

      // ❌ si alguna vez habló
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
            "✨ No se detectaron fantasmas.\n" +
            "Todos han enviado al menos un mensaje de texto."
        });
      }

      return sock.sendMessage(jid, {
        text:
          "🕯️ *POSIBLES FANTASMAS DEL GRUPO*\n\n" +
          "⚠️ *Aviso:* este listado *NO es 100% exacto*.\n" +
          "Solo se muestran usuarios que *nunca han enviado texto* desde que el bot está en el grupo.\n\n" +
          fantasmas.map(u => `👻 @${u.id.split("@")[0]}`).join("\n") +
          "\n\n🗑️ Para eliminarlos usa:\n" +
          "👉 *.kickfantasmas*",
        mentions: fantasmas.map(u => u.id)
      });
    }

    // =========================
    // 🗑️ .kickfantasmas (SIN CONFIRMACIÓN)
    // =========================
    if (command === "kickfantasmas") {
      if (!isBotAdmin) {
        return sock.sendMessage(jid, {
          text: "❌ Necesito ser administrador para expulsar usuarios."
        });
      }

      if (!fantasmas.length) {
        return sock.sendMessage(jid, {
          text: "✨ No hay fantasmas para expulsar."
        });
      }

      const ids = fantasmas.map(u => u.id);

      await sock.sendMessage(jid, {
        text:
          "🗑️ *Expulsando usuarios que nunca enviaron mensajes*\n\n" +
          ids.map(x => `👻 @${x.split("@")[0]}`).join("\n"),
        mentions: ids
      });

      try {
        await sock.groupParticipantsUpdate(jid, ids, "remove");
      } catch (e) {
        console.log("❌ Error expulsando fantasmas:", e);
      }
    }
  }
};
