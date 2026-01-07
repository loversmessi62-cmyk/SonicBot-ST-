export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      store,
      groupAdmins
    } = ctx;

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    // 🔒 admins normalizados
    const adminIds = groupAdmins.map(a =>
      a.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
    );

    // ✅ ACTIVOS = los que hablaron alguna vez
    const activos = participants.filter(p => {
      const id = p.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "");

      // no contar admins
      if (adminIds.includes(id)) return false;

      return Boolean(chat[id]);
    });

    if (!activos.length) {
      return sock.sendMessage(jid, {
        text:
          "⚠️ Aún no hay registros de actividad.\n" +
          "Escribe algo primero y luego usa *.fantasmas*."
      });
    }

    return sock.sendMessage(jid, {
      text:
        "📊 *USUARIOS ACTIVOS DETECTADOS*\n\n" +
        `✅ Activos: *${activos.length}*\n` +
        `👥 Total grupo: *${participants.length}*\n\n` +
        "🕯️ *FANTASMAS*\n" +
        "Los usuarios que *NO aparecen mencionados* abajo\n" +
        "son los que *nunca han enviado mensajes* desde que el bot está en el grupo.\n\n" +
        activos.map(u => `👤 @${u.id.split("@")[0]}`).join("\n"),
      mentions: activos.map(u => u.id)
    });
  }
};
