import axios from "axios";

export default {
  commands: ["qc"],
  category: "fun",

  async run(sock, msg, args, ctx) {
    const text = args.join(" ");
    if (!text)
      return sock.sendMessage(
        ctx.jid,
        { text: "✏️ Escribe un texto.\nEjemplo:\n.qc Hola soy AdriBot" },
        { quoted: msg }
      );

    const sender = msg.key.participant || msg.key.remoteJid;

    // Obtener foto
    let pfp;
    try {
      pfp = await sock.profilePictureUrl(sender, "image");
    } catch {
      pfp = "https://files.catbox.moe/k98we9.jpeg";
    }

    try {
      // Llamada a API QC
      const url = `https://yokobot.xyz/api/quote?avatar=${encodeURIComponent(
        pfp
      )}&name=${encodeURIComponent(
        ctx.pushName || "Usuario"
      )}&text=${encodeURIComponent(text)}&wm=${encodeURIComponent(
        "Hecho por ADRIBOT"
      )}`;

      const res = await axios.get(url, { responseType: "arraybuffer" });

      await sock.sendMessage(
        ctx.jid,
        { sticker: res.data },
        { quoted: msg }
      );
    } catch (e) {
      console.log("QC error:", e);
      return sock.sendMessage(ctx.jid, {
        text: "❌ Error generando QC."
      });
    }
  }
};
