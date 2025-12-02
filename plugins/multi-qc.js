import Jimp from "jimp";

export default {
    commands: ["qc"],
    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;
        const sender = msg.pushName || "Usuario";
        const texto = args.join(" ") || "Sin mensaje";

        // Tamaño tipo sticker
        const size = 512;

        // Crear fondo negro
        const img = new Jimp(size, size, "#000000");

        // Hacer esquinas redondeadas (bordes 50px)
        const radius = 90;
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
            const dx = x < radius ? radius - x : x > this.bitmap.width - radius ? x - (this.bitmap.width - radius) : 0;
            const dy = y < radius ? radius - y : y > this.bitmap.height - radius ? y - (this.bitmap.height - radius) : 0;
            if (dx * dx + dy * dy > radius * radius) this.bitmap.data[idx + 3] = 0;
        });

        // Fuentes
        const fontOrange = await Jimp.loadFont(Jimp.FONT_SANS_64_ORANGE);
        const fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

        // Texto
        img.print(
            fontOrange,
            40,
            120,
            {
                text: sender,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            size - 80,
            100
        );

        img.print(
            fontWhite,
            40,
            240,
            {
                text: texto,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            size - 80,
            200
        );

        // Convertir a WebP para sticker
        const buffer = await img.getBufferAsync("image/webp");

        await sock.sendMessage(jid, {
            sticker: buffer
        });
    }
};
