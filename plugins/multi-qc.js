import Jimp from "jimp";

export default {
    commands: ["qc"],
    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;
        const sender = msg.pushName || "Usuario";
        const texto = args.join(" ") || "Sin mensaje";

        // Crear lienzo 700x700 fondo blanco
        const img = new Jimp(700, 700, "#ffffff");

        // Cargar fuente negra 32px
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        // Marco negro
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
            if (x < 10 || x > this.bitmap.width - 10 || y < 10 || y > this.bitmap.height - 10) {
                this.bitmap.data[idx] = 0;     // R
                this.bitmap.data[idx + 1] = 0; // G
                this.bitmap.data[idx + 2] = 0; // B
                this.bitmap.data[idx + 3] = 255; // A
            }
        });

        // Texto del QC
        const mensaje =
`✨ QC DE: ${sender}
💬 MENSAJE: ${texto}`;

        // Imprimir el texto
        img.print(
            font,
            40,
            40,
            {
                text: mensaje,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            620,
            620
        );

        // Convertir a PNG
        const buffer = await img.getBufferAsync(Jimp.MIME_PNG);

        // Enviar como STICKER
        await sock.sendMessage(jid, {
            sticker: buffer
        });

    }
};
