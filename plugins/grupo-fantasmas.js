export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      store,
      groupMetadata
    } = ctx;

    // ===============================
    // 🔧 NORMALIZADOR (MISMO QUE ADMINS)
    // ===============================
    const normalizeAll = jid => {
      if (!jid) return null;
      return jid
        .toString()
        .replace(/@s\.whatsapp\.net/g, "")
        .replace(/@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/[^0-9]/g, "");
    };

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    // ===============================
    // 📋 PARTICIPANTES NORMALIZADOS
    // ===============================
    const users = participants.map(p => {
      const num = normalizeAll(p.id);
      return {
        id: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló: Boolean(chat[num]),
        data: chat[num] || null
      };
    });

    // ===============================
    // 📊 CLASIFICACIÓN REAL
    // ===============================
    const activos = users.filter(u => u.habló);
    const fantasmas = users.filter(u => !u.habló);

    // ===============================
    // 🧪 LOG TIPO .TODOS (CONSOLA)
    // ===============================
    console.log("══════════════════════════════════════");
    console.log("👻 FANTASMAS CHECK (REAL)");
    console.log("Grupo:", groupMetadata?.subject || jid);
    console.log("Total usuarios:", users.length);
    console.log("Activos:", activos.length);
    console.log("Fantasmas:", fantasmas.length);
    console.log("──────────────────────────────────────");

    for (const u of users) {
      console.log(u.num);
      console.log(" ├ admin:", u.admin);
      console.log(" ├ habló:", u.habló);
      console.log(" └ data:", u.data || "NUNCA HABLÓ");
    }

    console.log("══════════════════════════════════════");

    // ===============================
    // 📩 RESPUESTA EN WHATSAPP
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text:
          "✨ *No hay fantasmas detectados*\n\n" +
          "Todos los usuarios han enviado al menos un mensaje\n" +
          "desde que el bot está activo."
      });
    }

    let text =
      "👻 *USUARIOS SIN MENSAJES DETECTADOS*\n\n" +
      "📌 Detección basada en mensajes vistos por el bot.\n\n";

    text += fantasmas.map(u => `👻 @${u.num}`).join("\n");

    return sock.sendMessage(jid, {
      text,
      mentions: fantasmas.map(u => u.id)
    });
  }
};