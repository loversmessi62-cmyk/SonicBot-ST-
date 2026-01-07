export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, store, isBotAdmin } = ctx;

    // asegurar store
    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    // función para normalizar IDs (MISMA que el handler)
    const normalize = jid =>
      jid
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "");

    // detectar comando real
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    const command = text.slice(1).split(" ")[0].toLowerCase();

    // detectar fantasmas reales
    const fantasmas = participants.filter(p => {
      if (!p.id) return false;

      const id = normalize(p.id);
      const count = chat[id] || 0;

      return count === 0; // nunca enviaron NADA
    });

    // =========================
    // 👻 .fantasmas
    // =========================
    if (command === "fantasmas") {
      if (fantasmas.length === 0) {
        return sock.sendMessage(jid, {
          text: "✨ No hay fantasmas en este grupo."
        });
      }

      const tags = fantasmas
        .map(u => `@${normalize(u.id)}`)
        .join("\n");

      return sock.sendMessage(jid, {
        text:
          `🕯️ *FANTASMAS DEL GRUPO*\n\n` +
          `${tags}\n\n` +
          `⚠️ No han enviado mensajes, stickers, reacciones ni medios.`,
        mentions: fantasmas.map(u => u.id)
      });
    }

    // =========================
    // 🗑️ .kickfantasmas
    // =========================
    if (command === "kickfantasmas") {
      if (!isBotAdmin) {
        return sock.sendMessage(jid, {
          text: "❌ Necesito ser administrador para expulsarlos."
        });
      }

      if (fantasmas.length === 0) {
        return sock.sendMessage(jid, {
          text: "✨ No hay fantasmas que expulsar."
        });
      }

      const ids = fantasmas.map(u => u.id);

      await sock.sendMessage(jid, {
        text:
          `🗑️ *Expulsando fantasmas…*\n\n` +
          ids.map(x => `@${normalize(x)}`).join("\n"),
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
