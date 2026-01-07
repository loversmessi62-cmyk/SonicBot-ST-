export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, store, isBotAdmin } = ctx;
    const command = ctx.args ? ctx.msg.text?.slice(1).split(" ")[0] : null;

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    // 👻 fantasmas reales
    const inactivos = participants.filter(p => {
      const count = chat[p.id] || 0;
      return count === 0;
    });

    // ===== .fantasmas =====
    if (ctx.command === "fantasmas") {
      if (!inactivos.length)
        return sock.sendMessage(jid, { text: "✨ No hay fantasmas en este grupo." });

      return sock.sendMessage(jid, {
        text:
          "🕯️ *FANTASMAS DEL GRUPO*\n\n" +
          inactivos.map(u => `@${u.id.split("@")[0]}`).join("\n"),
        mentions: inactivos.map(u => u.id)
      });
    }

    // ===== .kickfantasmas =====
    if (ctx.command === "kickfantasmas") {
      if (!isBotAdmin)
        return sock.sendMessage(jid, { text: "❌ Necesito ser admin para expulsar." });

      if (!inactivos.length)
        return sock.sendMessage(jid, { text: "✨ No hay fantasmas que expulsar." });

      const ids = inactivos.map(u => u.id);

      await sock.sendMessage(jid, {
        text:
          "🗑️ *Expulsando fantasmas…*\n\n" +
          ids.map(x => `@${x.split("@")[0]}`).join("\n"),
        mentions: ids
      });

      await sock.groupParticipantsUpdate(jid, ids, "remove");
    }
  }
};
