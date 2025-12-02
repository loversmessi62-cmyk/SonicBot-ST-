import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { createCanvas, loadImage } from "canvas";

export default {
    commands: ["qc"],
    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const sender = msg.pushName || "Usuario";

        if (!args.length)
            return sock.sendMessage(jid, { text: "✨ Escribe el texto para generar el QC.\n\nEjemplo:\n.qc Hola mundo" });

        const texto = args.join(" ");

        // ======== CANVAS PARA EL STICKER ==========
        const width = 700;
        const height = 500;
        const canvas = createCanvas(width, height);
        const ctx2 = canvas.getContext("2d");

        // Fondo blanco
        ctx2.fillStyle = "#ffffff";
        ctx2.fillRect(0, 0, width, height);

        // Estilo del marco
        ctx2.strokeStyle = "#000000";
        ctx2.lineWidth = 10;
        ctx2.strokeRect(30, 30, width - 60, height - 60);

        // Texto principal
        ctx2.fillStyle = "#000000";
        ctx2.font = "bold 40px Sans";
        ctx2.fillText(`✨ QC DE: ${sender}`, 60, 120);

        ctx2.font = "bold 40px Sans";
        ctx2.fillText(`💬 MENSAJE:`, 60, 200);

        ctx2.font = "35px Sans";
        ctx2.fillText(texto, 60, 260);

        // ======== CREACIÓN DEL STICKER ==========
        const buffer = canvas.toBuffer();

        const sticker = new Sticker(buffer, {
            pack: "Adri QC",
            author: "Adri Bot",
            type: StickerTypes.FULL,
            quality: 90
        });

        const stkrBuffer = await sticker.toBuffer();

        await sock.sendMessage(jid, {
            sticker: stkrBuffer
        });
    }
};
