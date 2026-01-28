import config from "../config.js";

export default {
  commands: ["owner"],
  category: "info",

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    // 👑 OWNER PRINCIPAL (TÚ)
    const ownerNum = config.owners[0]; // ej: 521XXXXXXXXXX
    const ownerJid = ownerNum + "@s.whatsapp.net";

    // 📇 VCARD (CONTACTO)
    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      "FN:Orlan | Owner SonicBot\n" +
      "ORG:SonicBot\n" +
      "TITLE:Owner\n" +
      `TEL;type=CELL;type=VOICE;waid=${ownerNum}:${ownerNum}\n` +
      "END:VCARD";

    await sock.sendMessage(jid, {
      contacts: {
        displayName: "orlan | Owner SonicBot",
        contacts: [
          {
            vcard
          }
        ]
      }
    });
  }
};