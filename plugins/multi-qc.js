import Jimp from "jimp";
import path from "path";

export default {
    commands: ["qc"],
    async run(sock, msg, args, ctx) {

        const texto = args.join(" ");
        const user = ctx.pushName || "Usuario";

        if (!texto)
            return sock.sendMessage(ctx.chat, { text: "❌ Ingresa un mensaje\nEj: .qc hola" });

        // ================================
        //   Cargar fuentes personalizadas
        // ================================
        const fontHeader = await Jimp.loadFont("./fonts/wh-naranja.fnt");
        const fontBody = await Jimp.loadFont("./fonts/wh-blanca.fnt");

        // ================================
        //     Crear imagen 512x512
        // ================================
        const img = new Jimp(512, 512, "#000000");

        // ================================
        //     Escribir texto
        // ================================
        img.print(fontHeader, 30, 40, `Usuario: ${user}`);
        img.print(fontBody, 30, 150, texto, 450);

        // ================================
        //     Guardar temporal
        // ================================
        const out = "./temp/qc-" + Date.now() + ".png";
        await img.writeAsync(out);

        // ================================
        //     Enviar como sticker
        // ================================
        await sock.sendMessage(ctx.chat, {
            sticker: { url: out }
        });

        // ================================
        //     Borrar archivo temporal
        // ================================
        setTimeout(() => {
            try { fs.unlinkSync(out); } catch {}
        }, 3000);
    }
};
