export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, groupMetadata, store } = ctx;

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    const normalize = v =>
      v?.toString()
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/\D/g, "");

    const usuarios = participants.map(p => {
      const num = normalize(p.id);

      return {
        id: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló: Boolean(chat[num])
      };
    });

    const fantasmas = usuarios.filter(u => !u.habló);
    const activos = usuarios.filter(u => u.habló);

    // ===============================
    // 🧪 LOG COMPLETO EN CONSOLA
    // ===============================
    console.log("══════════════════════════════");
    console.log("👻 FANTASMAS CHECK");
    console.log("👥 Grupo:", groupMetadata?.subject || jid);
    console.log("👤 Total:", usuarios.length);
    console.log("✅ Activos:", activos.length);
    console.log("👻 Fantasmas:", fantasmas.length);
    console.log("──────────────────────────────");

    usuarios.forEach(u => {
      console.log(`@${u.num}`);
      console.log(" ├ admin:", u.admin);
      console.log(" ├ habló:", u.habló);
      console.log(
        " └ data:",
        u.habló ? new Date(chat[u.num]).toLocaleString() : "NUNCA"
      );
    });

    console.log("══════════════════════════════");

    // ===============================
    // 📩 RESPUESTA EN WHATSAPP
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text:
          "✅ *Todos han enviado al menos un mensaje de texto*\n\n" +
          "ℹ️ Conteo desde que el bot está en el grupo."
      });
    }

    return sock.sendMessage(jid, {
      text:
        "👻 *USUARIOS QUE NO HAN HABLADO*\n\n" +
        "⚠️ Lista basada únicamente en mensajes de texto.\n\n" +
        fantasmas.map(u => `👻 @${u.num}`).join("\n"),
      mentions: fantasmas.map(u => u.id)
    });
  }
};
