import axios from "axios";

export default {
  commands: ["qc"],
  category: "fun",

  async run(sock, msg, args, ctx) {
    const text = args.join(" ");
    if (!text)
      return sock.sendMessage(
        ctx.jid,
        { text: "✏️ Escribe un texto.\nEjemplo:\n.qc Hola soy ADRIBOT" },
        { quoted: msg }
      );

    const sender = msg.key.participant || msg.key.remoteJid;

    // FOTO DE PERFIL
    let avatar;
    try {
      avatar = await sock.profilePictureUrl(sender, "image");
    } catch {
      avatar = "https://files.catbox.moe/k98we9.jpeg";
    }

    try {
      // API estable (x0)
      const api = `https://x0.yourapi.pro/quote?avatar=${encodeURIComponent(
        avatar
      )}&name=${encodeURIComponent(
        ctx.pushName || "Usuario"
      )}&text=${encodeURIComponent(
        text
      )}&wm=${encodeURIComponent("Hecho por ADRIBOT")}`;

      const { data } = await axios.get(api, { responseType: "arraybuffer" });

      await sock.sendMessage(
        ctx.jid,
        { sticker: data },
        { quoted: msg }
      );

    } catch (e) {
      console.error("QC error:", e);
      return sock.sendMessage(
        ctx.jid,
        { text: "❌ Error generando QC (API no respondió)." },
        { quoted: msg }
      );
    }
  }
};
