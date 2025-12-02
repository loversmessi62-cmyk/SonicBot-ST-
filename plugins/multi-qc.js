import Jimp from "jimp";

export default {
    commands: ["qc"],
    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;
        const sender = msg.pushName || "Usuario";
        const texto = args.join(" ") || "Sin mensaje";

        // Crear imagen 600x600 blanca
        const img = new Jimp(600, 600, "#ffffff");

        // Fuente
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        // Texto del QC
        const mensaje = 
`✨ QC DE: ${sender}
💬 MENSAJE: ${texto}`;

        // Escribir el texto centrado
        img.print(
            font,
            20,
            20,
            {
                text: mensaje,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            560,
            560
        );

        // Convertir a buffer PNG
        const buffer = await img.getBufferAsync(Jimp.MIME_PNG);

        // Enviar como sticker
        await sock.sendMessage(jid, {
            sticker: buffer
        });

    }
};
