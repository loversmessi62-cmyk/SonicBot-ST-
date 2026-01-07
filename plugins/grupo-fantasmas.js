export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, groupMetadata, store } = ctx;

    // ===============================
    // 🔑 NORMALIZADOR (MISMO DEL HANDLER)
    // ===============================
    const normalizeUser = jid =>
      jid
        ?.toString()
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/\D/g, "");

    const chatStore = store.chats[jid] || {};
    const ahora = Date.now();

    // ===============================
    // 👥 MAPEAR USUARIOS DEL GRUPO
    // ===============================
    const usuarios = participants.map(p => {
      const num = normalizeUser(p.id);
      const data = chatStore[num] || null;

      return {
        id: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló: !!data,
        last: data?.time || null
      };
    });

    const fantasmas = usuarios.filter(u => !u.habló);
    const activos = usuarios.filter(u => u.habló);

    // ===============================
    // 🧪 LOG CONSOLA (TU IDEA, TIPO .ADMINS)
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
        u.last
          ? new Date(u.last).toLocaleString("es-MX")
          : "NUNCA"
      );
    });

    console.log("══════════════════════════════");

    // ===============================
    // 📩 RESPUESTA EN WHATSAPP
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text: "✅ *No se detectaron fantasmas.*\nTodos han enviado al menos un mensaje desde que el bot está en el grupo."
      });
    }

    return sock.sendMessage(jid, {
      text:
        "👻 *USUARIOS QUE NUNCA HAN HABLADO*\n" +
        "⚠️ _Basado desde que el bot entró_\n\n" +
        fantasmas.map(u => `👻 @${u.num}`).join("\n"),
      mentions: fantasmas.map(u => u.id)
    });
  }
};
