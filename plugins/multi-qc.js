import axios from "axios";
import fs from "fs";
import { makeSticker } from "../utils/sticker-func.js";   // ✔ IMPORT CORRECTO

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
      //     CREAR LIENZO QC
      // ============================
      const { createCanvas, loadImage } = await import("canvas");

      const canvas = createCanvas(800, 400);
      const ctx2 = canvas.getContext("2d");

      // Fondo negro
      ctx2.fillStyle = "#000";
      ctx2.fillRect(0, 0, 800, 400);

      // Foto circular
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

      // Texto ingresado
      ctx2.fillStyle = "#fff";
      ctx2.font = "70px Sans-serif";
      ctx2.fillText(text, 320, 280);

      const finalImage = canvas.toBuffer();

      // ============================
      //     CONVERTIR A STICKER
      // ============================
      const stickerFinal = await makeSticker(finalImage);

      await sock.sendMessage(
        jid,
        { sticker: stickerFinal },
        { quoted: msg }
      );

    } catch (e) {
      console.error(e);
      return sock.sendMessage(ctx.jid, {
        text: "❌ Error generando la QC."
      });
    }
  }
};
