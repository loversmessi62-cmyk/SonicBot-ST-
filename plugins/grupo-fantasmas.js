export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, groupMetadata } = ctx;

    const normalizeAll = v =>
      v?.toString()
        .replace(/@s\.whatsapp\.net/g, "")
        .replace(/@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/[^0-9]/g, "");

    const messageLog = global.messageLog?.[jid] || {};

    const usuarios = participants.map(p => {
      const num = normalizeAll(p.id);

      const habló =
        Boolean(messageLog[p.id]) ||
        Boolean(messageLog[num]) ||
        Object.values(messageLog).some(r =>
          r.sender === p.id ||
          r.participant === p.id ||
          normalizeAll(r.sender) === num
        );

      return {
        id: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló
      };
    });

    const fantasmas = usuarios.filter(u => !u.habló);
    const activos = usuarios.filter(u => u.habló);

    // ===============================
    // 🧪 LOG TIPO .TODOS (COMPLETO)
    // ===============================
    console.log("══════════════════════════════════════");
    console.log("👻 FANTASMAS CHECK (MISMO NIVEL ADMINS)");
    console.log("Grupo:", groupMetadata?.subject || jid);
    console.log("Total:", usuarios.length);
    console.log("Activos:", activos.length);
    console.log("Fantasmas:", fantasmas.length);
    console.log("──────────────────────────────────────");

    usuarios.forEach(u => {
      console.log(`Usuario: ${u.num}`);
      console.log(" ├ id:", u.id);
      console.log(" ├ admin:", u.admin);
      console.log(" ├ habló:", u.habló);
    });

    console.log("══════════════════════════════════════");

    // ===============================
    // 📩 RESPUESTA EN WHATSAPP
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text: "✅ *Todos los usuarios han enviado mensajes desde que el bot está activo.*"
      });
    }

    return sock.sendMessage(jid, {
      text:
        "👻 *USUARIOS QUE NO HAN ENVIADO MENSAJES*\n\n" +
        fantasmas.map(u => `👻 @${u.num}`).join("\n"),
      mentions: fantasmas.map(u => u.id)
    });
  }
};