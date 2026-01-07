export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, store, groupMetadata } = ctx;

    // ===============================
    // 🔧 NORMALIZADOR (CLON DEL HANDLER)
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
    // 📦 STORE NORMALIZADO (CLAVE)
    // ===============================
    const activeMap = {};
    for (const rawId in chat) {
      const n = normalizeAll(rawId);
      if (n) activeMap[n] = chat[rawId];
    }

    // ===============================
    // 👥 PARTICIPANTES NORMALIZADOS
    // ===============================
    const users = participants.map(p => {
      const num = normalizeAll(p.id);
      return {
        raw: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló: Boolean(activeMap[num]),
        data: activeMap[num] || null
      };
    });

    const activos = users.filter(u => u.habló);
    const fantasmas = users.filter(u => !u.habló);

    // ===============================
    // 🧪 LOG EXACTO TIPO .TODOS
    // ===============================
    console.log("══════════════════════════════════════");
    console.log("👻 FANTASMAS CHECK (ADMIN-LEVEL)");
    console.log("Grupo:", groupMetadata?.subject || jid);
    console.log("Total usuarios:", users.length);
    console.log("Activos:", activos.length);
    console.log("Fantasmas:", fantasmas.length);
    console.log("──────────────────────────────────────");

    users.forEach(u => {
      console.log(u.num);
      console.log(" ├ admin:", u.admin);
      console.log(" ├ habló:", u.habló);
      console.log(" └ data:", u.data || "NUNCA HABLÓ");
    });

    console.log("══════════════════════════════════════");

    // ===============================
    // 📩 RESPUESTA WHATSAPP
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text:
          "✅ *Todos los usuarios han enviado mensajes*\n\n" +
          "La verificación se hizo con el mismo sistema que admins."
      });
    }

    const text =
      "👻 *USUARIOS SIN MENSAJES DETECTADOS*\n\n" +
      fantasmas.map(u => `👻 @${u.num}`).join("\n");

    return sock.sendMessage(jid, {
      text,
      mentions: fantasmas.map(u => u.raw)
    });
  }
};