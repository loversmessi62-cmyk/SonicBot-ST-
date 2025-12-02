import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  commands: ["qc"],
  category: "fun",

  async run(sock, msg, args, ctx) {
    try {
      const text = args.join(" ") || "Sin texto";
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      // ---------------------------
      // OBTENER FOTO DE PERFIL
      // ---------------------------
      let profilePic;

      try {
        profilePic = await sock.profilePictureUrl(sender, "image");
      } catch {
        // Si NO tiene foto → usar la tuya por defecto
        profilePic = "./media/qc_default.jpg";
      }

      // Si viene URL → descargarla
      let avatarBuffer;
      if (profilePic.startsWith("http")) {
        const res = await axios.get(profilePic, { responseType: "arraybuffer" });
        avatarBuffer = Buffer.from(res.data);
      } else {
        avatarBuffer = fs.readFileSync(profilePic);
      }

      // ---------------------------
      // CREAR IMAGEN TIPO QC
      // ---------------------------
      const { createCanvas, loadImage } = await import("canvas");

      const canvas = createCanvas(800, 400);
      const ctx2 = canvas.getContext("2d");

      // Fondo negro
      ctx2.fillStyle = "#000";
      ctx2.fillRect(0, 0, 800, 400);

      // Foto usuario
      const avatar = await loadImage(avatarBuffer);
      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(150, 200, 120, 0, Math.PI * 2);
      ctx2.closePath();
      ctx2.clip();
      ctx2.drawImage(avatar, 30, 80, 240, 240);
      ctx2.restore();

      // Nombre
      ctx2.fillStyle = "#ffa646";
      ctx2.font = "bold 80px Sans-serif";
      ctx2.fillText(ctx.pushName || "Usuario", 320, 180);

      // Texto debajo
      ctx2.fillStyle = "#fff";
      ctx2.font = "70px Sans-serif";
      ctx2.fillText(text, 320, 280);

      const output = canvas.toBuffer();

      // ---------------------------
      // ENVIAR IMAGEN FINAL
      // ---------------------------
      await sock.sendMessage(jid, { image: output });

    } catch (e) {
      console.error(e);
      return sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error generando la QC.",
      });
    }
  }
};
