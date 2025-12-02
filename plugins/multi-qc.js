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
            const userPfp = ppUrl 
                ? await Jimp.read(ppUrl)
                : await Jimp.read("https://i.imgur.com/TrcVn5E.png");

            userPfp.resize(200, 200).circle(); 

            // Lienzo transparente
            const img = new Jimp(800, 400, 0x00000000);

            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

            img.print(font, 230, 40, username);
            img.print(font, 230, 120, text, 520);
            img.composite(userPfp, 20, 20);

            img.autocrop({ leaveBorder: 20 });

            // GENERAR PNG
            const buffer = await img.getBufferAsync(Jimp.MIME_PNG);

            await sock.sendMessage(jid, {
                sticker: { url: buffer }
            });

        } catch (e) {
            console.log("QC ERROR:", e);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Error en .qc" });
        }
    }
};
