import axios from "axios";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

export default {
  commands: ["qc"],
  category: "fun",

  async run(sock, msg, args, ctx) {
    try {
      const text = args.join(" ") || "Sin texto";
      const { jid } = ctx;

      const sender = msg.key.participant || msg.key.remoteJid;

      // ============================
      //     FOTO DE PERFIL
      // ============================
      let profilePic;
      try {
        profilePic = await sock.profilePictureUrl(sender, "image");
      } catch {
        profilePic = "https://files.catbox.moe/k98we9.jpeg";
      }

      const res = await axios.get(profilePic, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(res.data);

      // ============================
      //     CREAR QC CON CANVAS
      // ============================
      const { createCanvas, loadImage } = await import("canvas");

      const canvas = createCanvas(900, 500);
      const ctx2 = canvas.getContext("2d");

      // Fondo
      ctx2.fillStyle = "#1a1a1a";
      ctx2.fillRect(0, 0, 900, 500);

      // Avatar circular
      const avatar = await loadImage(avatarBuffer);
      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(150, 250, 130, 0, Math.PI * 2);
      ctx2.closePath();
      ctx2.clip();
      ctx2.drawImage(avatar, 20, 120, 260, 260);
      ctx2.restore();

      // Nombre
      ctx2.fillStyle = "#ffb84c";
      ctx2.font = "bold 70px Sans-serif";
      ctx2.fillText(ctx.pushName || "Usuario", 320, 200);

      // Caja de texto estilo QC
      ctx2.fillStyle = "#333";
      ctx2.roundRect(310, 250, 540, 160, 25);
      ctx2.fill();

      // Texto
      ctx2.fillStyle = "#fff";
      ctx2.font = "50px Sans-serif";
      ctx2.fillText(text, 330, 350);

      const finalPNG = canvas.toBuffer();

      // ============================
      //   CREAR STICKER WEBP FINAL
      // ============================
      const input = path.join(process.cwd(), `qc_${Date.now()}.png`);
      const output = path.join(process.cwd(), `qc_${Date.now()}.webp`);

      fs.writeFileSync(input, finalPNG);

      // convertir png a sticker webp
      await new Promise((resolve, reject) => {
        ffmpeg(input)
          .addOutputOptions([
            "-vcodec", "libwebp",
            "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=black,setsar=1",
            "-lossless", "1",
            "-preset", "picture",
            "-loop", "0",
            "-an"
          ])
          .save(output)
          .on("end", resolve)
          .on("error", reject);
      });

      const sticker = fs.readFileSync(output);

      await sock.sendMessage(jid, { sticker }, { quoted: msg });

      fs.unlinkSync(input);
      fs.unlinkSync(output);

    } catch (e) {
      console.error(e);
      return sock.sendMessage(ctx.jid, {
        text: "❌ Error generando la QC."
      });
    }
  }
};
