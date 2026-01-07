export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, store, groupMetadata } = ctx;

    // ===============================
    // 🔧 NORMALIZADOR (IDÉNTICO AL HANDLER)
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
    // 📦 STORE NORMALIZADO (FUENTE REAL)
    // ===============================
    const activityMap = {};
    for (const raw in chat) {
      const n = normalizeAll(raw);
      if (n) activityMap[n] = chat[raw];
    }

    // ===============================
    // 👥 USUARIOS NORMALIZADOS
    // ===============================
    const users = participants.map(p => {
      const num = normalizeAll(p.id);
      const data = activityMap[num];

      return {
        raw: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló: Boolean(data),
        data
      };
    });

    const activos = users.filter(u => u.habló);
    const fantasmas = users.filter(u => !u.habló);

    // ===============================
    // 📟 LOG CLON DEL LOG DE MENSAJES
    // ===============================
    try {
      const time = new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      const groupName = groupMetadata?.subject || "DESCONOCIDO";

      console.log(
`╔════════════════════════════════════╗
║ 🕒 ${time} ║ 👥 ${groupName} ║ 👻 FANTASMAS LOG ║
╚════════════════════════════════════╝`
      );

      users.forEach(u => {
        const tipo = u.habló ? "ACTIVO" : "FANTASMA";
        const msgType = u.data?.type || "NUNCA";
        const lastTime = u.data?.time
          ? new Date(u.data.time).toLocaleTimeString("es-MX")
          : "--:--";

        console.log(
`╔════════════════════════════════════╗
║ 👤 ${u.num}
║ 📎 Estado: ${tipo}
║ 🛡️ Admin: ${u.admin}
║ 🕒 Último: ${lastTime}
║ 💬 Tipo: ${msgType}
╚════════════════════════════════════╝`
        );
      });

    } catch (e) {
      console.error("❌ Error en log de fantasmas:", e);
    }

    // ===============================
    // 📩 RESPUESTA EN WHATSAPP
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text: "✅ *Todos los usuarios han enviado mensajes desde que el bot está activo.*"
      });
    }

    const text =
      "👻 *Usuarios que NO han enviado mensajes*\n\n" +
      fantasmas.map(u => `👻 @${u.num}`).join("\n");

    return sock.sendMessage(jid, {
      text,
      mentions: fantasmas.map(u => u.raw)
    });
  }
};