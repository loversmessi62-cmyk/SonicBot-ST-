export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, store, isBotAdmin } = ctx;

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    const inactivos = participants.filter(p => {
      const id = p.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "");

      const count = chat[id] || 0;
      return count === 0;
    });

    // ---- .fantasmas ----
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

    // ---- .kickfantasmas ----
    if (ctx.command === "kickfantasmas") {
      if (!isBotAdmin)
        return sock.sendMessage(jid, { text: "❌ Necesito ser admin." });

      if (!inactivos.length)
        return sock.sendMessage(jid, { text: "✨ No hay fantasmas." });

      const ids = inactivos.map(u => u.id);

      await sock.sendMessage(jid, {
        text: "🗑️ Expulsando fantasmas…",
        mentions: ids
      });

      await sock.groupParticipantsUpdate(jid, ids, "remove");
    }
  }
};
