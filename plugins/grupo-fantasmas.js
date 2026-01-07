export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      store,
      isBotAdmin,
      groupAdmins
    } = ctx;

    if (!store.chats[jid]) store.chats[jid] = {};

    const chat = store.chats[jid];
    const now = Date.now();

  
    // obtener admins
    const adminIds = groupAdmins.map(a =>
      a.id.replace(/@s\.whatsapp\.net|@lid/g, "").replace(/:\d+/g, "")
    );

    // 👻 detectar fantasmas
    const fantasmas = participants.filter(p => {
      const id = p.id.replace(/@s\.whatsapp\.net|@lid/g, "").replace(/:\d+/g, "");

      // ❌ no tocar admins
      if (adminIds.includes(id)) return false;

      const last = chat[id];

      // nunca habló o pasó el tiempo
      return !last || now - last > INACTIVITY_TIME;
    });

    // =========================
    // 👻 .fantasmas
    // =========================
    if (ctx.args.length === 0 && ctx.msg.message?.conversation?.includes("fantasmas")) {

      if (!fantasmas.length)
        return sock.sendMessage(jid, {
          text: "✨ No se detectaron fantasmas con más de *2 días* de inactividad."
        });

      return sock.sendMessage(jid, {
        text:
          "🕯️ *POSIBLES FANTASMAS DEL GRUPO*\n\n" +
          "⚠️ *Aviso:* este listado *no es 100% exacto*.\n" +
          "Se detectan usuarios con *2 días o más* sin actividad.\n\n" +
          fantasmas.map(u => `👻 @${u.id.split("@")[0]}`).join("\n") +
          "\n\n🗑️ Para eliminarlos escribe:\n" +
          "👉 *.kickfantasmas confirmar*",
        mentions: fantasmas.map(u => u.id)
      });
    }

    // =========================
    // 🗑️ .kickfantasmas confirmar
    // =========================
    if (ctx.args[0] !== "confirmar") {
      return sock.sendMessage(jid, {
        text:
          "⚠️ *Confirmación requerida*\n\n" +
          "Este comando eliminará usuarios con *2 días o más* de inactividad.\n\n" +
          "Para continuar escribe:\n" +
          "👉 *.kickfantasmas confirmar*"
      });
    }

    if (!isBotAdmin)
      return sock.sendMessage(jid, {
        text: "❌ Necesito ser administrador para expulsar usuarios."
      });

    if (!fantasmas.length)
      return sock.sendMessage(jid, {
        text: "✨ No hay fantasmas para expulsar."
      });

    const ids = fantasmas.map(u => u.id);

    await sock.sendMessage(jid, {
      text:
        "🗑️ *Expulsando fantasmas (2+ días inactivos)*\n\n" +
        ids.map(x => `👻 @${x.split("@")[0]}`).join("\n"),
      mentions: ids
    });

    try {
      await sock.groupParticipantsUpdate(jid, ids, "remove");
    } catch (e) {
      console.log("❌ Error expulsando fantasmas:", e);
    }
  }
};
