export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const { jid, participants, groupMetadata } = ctx;

    const normalize = v =>
      v?.toString().replace(/\D/g, "");

    const activos =
      global.messageLog?.[jid]?.numbers || new Set();

    const usuarios = participants.map(p => {
      const num = normalize(p.id);

      return {
        id: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló: activos.has(num)
      };
    });

    const fantasmas = usuarios.filter(u => !u.habló);
    const activosList = usuarios.filter(u => u.habló);

    // ===============================
    // 🧪 LOG COMPLETO EN CONSOLA
    // ===============================
    console.log("══════════════════════════════════════");
    console.log("👻 FANTASMAS CHECK");
    console.log("👥 Grupo:", groupMetadata?.subject || jid);
    console.log("👤 Total:", usuarios.length);
    console.log("✅ Activos:", activosList.length);
    console.log("👻 Fantasmas:", fantasmas.length);
    console.log("──────────────────────────────────────");

    usuarios.forEach(u => {
      console.log("👤 Usuario");
      console.log(" ├ num:", u.num);
      console.log(" ├ habló:", u.habló);
      console.log(" ├ admin:", u.admin);
    });

    console.log("══════════════════════════════════════");

    // ===============================
    // 📩 RESPUESTA EN WHATSAPP
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text: "✅ *Todos han enviado mensajes desde que el bot está activo.*"
      });
    }

    return sock.sendMessage(jid, {
      text:
        "👻 *USUARIOS QUE NO HAN HABLADO*\n\n" +
        fantasmas.map(u => `👻 @${u.num}`).join("\n"),
      mentions: fantasmas.map(u => u.id)
    });
  }
};