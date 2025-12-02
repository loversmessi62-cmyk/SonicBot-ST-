import Jimp from "jimp";

export default {
    commands: ["qc", "quote"],
    category: "multi",
    admin: false,
    description: "Genera un sticker estilo QC sin usar APIs.",

    async run(sock, msg, args, ctx) {
        const { jid, download } = ctx;

        if (!args.length)
            return sock.sendMessage(jid, { text: "✏️ Escribe el texto del QC.\nEjemplo:\n.qc Hola bro" }, { quoted: msg });

        const text = args.join(" ");

        let buffer;
        try {
            buffer = await download();
        } catch {
            return sock.sendMessage(jid, { text: "❌ Envía o responde una imagen." }, { quoted: msg });
        }

        try {
            // ────────────────
            // Cargar imagen
            // ────────────────
            const img = await Jimp.read(buffer);

            // Efecto QC
            img.blur(10).brightness(-0.1);

            // Tamaño estándar
            img.resize(512, 512);

            // Marco negro
            const borderSize = 10;
            const bordered = new Jimp(img.bitmap.width + borderSize * 2, img.bitmap.height + borderSize * 2, "#000000");
            bordered.composite(img, borderSize, borderSize);

            // Banda negra abajo
            const bandHeight = 80;
            const finalImg = new Jimp(512, 512 + bandHeight, "#000000");
            finalImg.composite(bordered, 0, 0);

            // Cargar fuente
            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

            // Escribir texto centered
            finalImg.print(
                font,
                0,
                512 + 20,
                {
                    text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                },
                512,
                bandHeight
            );

            const stickerBuffer = await finalImg.getBufferAsync(Jimp.MIME_PNG);

            await sock.sendMessage(jid, { sticker: stickerBuffer }, { quoted: msg });

        } catch (err) {
            console.log(err);
            return sock.sendMessage(jid, { text: "⚠️ Error al generar el QC local." }, { quoted: msg });
        }
    }
};
