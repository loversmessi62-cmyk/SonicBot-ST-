import { sticker } from "../lib/sticker.js";
import { createCanvas, loadImage } from "canvas";

export default {
    commands: ["qc"],
    category: "stickers",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Obtener texto
        const texto = args.join(" ").trim();
        if (!texto) {
            return sock.sendMessage(jid, { text: "⚠️ Escribe un texto.\nEj: .qc Hola" });
        }

        try {
            // Usuario que pidió el comando
            const sender = msg.sender;

            // Nombre del usuario
            let name = await sock.getName(sender);
            if (!name) name = "Usuario";

            // Foto del usuario
            let photoURL = await sock.profilePictureUrl(sender)
                .catch(() => "https://telegra.ph/file/24fa902ead26340f3df2c.png");

            const avatarImg = await loadImage(photoURL);

            // STICKER SIZE
            const size = 600;
            const canvas = createCanvas(size, size);
            const ctx2 = canvas.getContext("2d");

            // FONDO NEGRO REDONDEADO
            const radius = 90;
            ctx2.beginPath();
            ctx2.moveTo(radius, 0);
            ctx2.lineTo(size - radius, 0);
            ctx2.quadraticCurveTo(size, 0, size, radius);
            ctx2.lineTo(size, size - radius);
            ctx2.quadraticCurveTo(size, size, size - radius, size);
            ctx2.lineTo(radius, size);
            ctx2.quadraticCurveTo(0, size, 0, size - radius);
            ctx2.lineTo(0, radius);
            ctx2.quadraticCurveTo(0, 0, radius, 0);
            ctx2.closePath();
            ctx2.fillStyle = "#000";
            ctx2.fill();

            // AVATAR CÍRCULO
            const avatarSize = 160;
            const avatarX = 80;
            const avatarY = size / 2 - 80;

            ctx2.save();
            ctx2.beginPath();
            ctx2.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx2.closePath();
            ctx2.clip();
            ctx2.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
            ctx2.restore();

            // NOMBRE (NARANJA)
            ctx2.fillStyle = "#ff9a32";
            ctx2.font = "bold 70px Sans";
            ctx2.textAlign = "left";
            ctx2.fillText(name, avatarX + avatarSize + 60, size / 2 - 10);

            // TEXTO (BLANCO)
            ctx2.fillStyle = "#ffffff";
            ctx2.font = "bold 70px Sans";
            ctx2.fillText(texto, avatarX + avatarSize + 60, size / 2 + 90);

            // Convertir a buffer
            const buffer = canvas.toBuffer("image/png");

            // Convertir a sticker
            const stk = await sticker(buffer, {}, "AdriPack", "AdriBot");

            // Enviar sin responderte
            await sock.sendMessage(jid, { sticker: stk });

        } catch (e) {
            console.error("QC ERROR:", e);
            return sock.sendMessage(jid, { text: "❌ Error creando el QC." });
        }
    }
};
