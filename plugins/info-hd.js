import Replicate from "replicate";

export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // DESCARGAR LA IMAGEN
        let buffer;
        try {
            buffer = await ctx.download();
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen o envía una imagen directamente.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen en HD...*" });

        try {
            const replicate = new Replicate({
                auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
            });

            // PASAMOS LA IMAGEN A BASE64
            const base64Image = "data:image/jpeg;base64," + buffer.toString("base64");

            // MODELO COMPATIBLE SIN upload()
            const output = await replicate.run(
                "cjwbw/real-esrgan",
                {
                    input: {
                        image: base64Image,
                        scale: 4
                    }
                }
            );

            // DEVOLVER IMAGEN HD
            await sock.sendMessage(jid, {
                image: { url: output },
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "❌ Ocurrió un error procesando la imagen."
            });
        }
    }
};
