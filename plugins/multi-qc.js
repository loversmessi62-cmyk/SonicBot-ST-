import Jimp from "jimp";

export default {
    commands: ["qc"],
    category: "stickers",

    async run(sock, msg, args, ctx) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const username = ctx.pushName || "Usuario";

            const text = args.join(" ");
            if (!text) return sock.sendMessage(jid, { text: "✏️ Escribe algo\nEjemplo: *.qc Hola*" });

            // Foto del usuario
            const ppUrl = await sock.profilePictureUrl(sender, "image").catch(() => null);
            const userPfp = ppUrl ? await Jimp.read(ppUrl) : await Jimp.read("https://i.imgur.com/TrcVn5E.png");

            userPfp.resize(200, 200).circle(); // foto redonda

            // Lienzo base
            const img = new Jimp(800, 400, "#00000000"); // transparente

            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

            // Escribir nombre
            img.print(font, 230, 40, username);

            // Escribir texto
            img.print(font, 230, 120, text, 520);

            // Poner foto
            img.composite(userPfp, 20, 20);

            // Ajusta los bordes detectando contenido real
            img.autocrop({ leaveBorder: 20 });

            const buffer = await img.getBufferAsync("image/webp");

            await sock.sendMessage(jid, {
                sticker: buffer
            });

        } catch (e) {
            console.log(e);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Error en .qc" });
        }
    }
};
