import Replicate from "replicate";

export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        let buffer;
        try {
            buffer = await ctx.download();
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen o envía una imagen directamente.*"
            });
        }

        await sock.sendMessage(jid, {
            text: "⏳ *Mejorando imagen en HD... espera un momento.*"
        });

        try {
            // CONFIGURA TU API KEY AQUI  ⬇️⬇️⬇️⬇️⬇️⬇️
            const replicate = new Replicate({
                auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
            });
            // EJEMPLO:
            // auth: "r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

            // SUBIR IMAGEN A REPLICATE
            const upload = await replicate.files.upload(buffer);

            // PROCESAR IMAGEN
            const output = await replicate.run(
                "xinntao/real-esrgan:latest",
                {
                    input: {
                        image: upload,
                        scale: 4
                    }
                }
            );

            await sock.sendMessage(jid, {
                image: { url: output },
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (err) {
            console.error("❌ ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "⚠️ Error al procesar la imagen en HD."
            });
        }
    }
};
