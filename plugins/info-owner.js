import config from "../config.js";

export default {
  commands: ["owner"],
  category: "info",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    // 👉 TOMAMOS EL PRIMER OWNER (TÚ)
    const ownerNum = config.owners[0];
    const ownerJid = ownerNum + "@s.whatsapp.net";

    await sock.sendMessage(jid, {
      text:
        "👑 *OWNER OFICIAL*\n\n" +
        "Este bot pertenece a:\n" +
        `➤ @${ownerNum}\n\n` +
        "_No hay discusión._ 😎🔥",
      mentions: [ownerJid]
    });
  }
};