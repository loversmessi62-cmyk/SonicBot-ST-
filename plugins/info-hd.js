import fetch from "node-fetch";
import FormData from "form-data";

export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // ============================
        //     DESCARGAR LA IMAGEN
        // ============================
        let buffer;
        try {
            buffer = await ctx.download(); 
        } catch {
            return sock.sendMessage(jid, {
                text: "❌ *Debes responder a una imagen para mejorarla.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Procesando imagen en HD...*" });

        try {
            // ============================
            //   FORM DATA REAL Y VÁLIDO
            // ============================
            const form = new FormData();
            form.append("image", buffer, {
                filename: "image.jpg",
                contentType: "image/jpeg"
            });

            // ============================
            //        PETICIÓN A DEEPAI
            // ============================
            const resp = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: {
                    "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07",
                    ...form.getHeaders()
                },
                body: form
            });

            const data = await resp.json();

            if (!data.output_url) {
                console.log("DeepAI Response:", data);
                return sock.sendMessage(jid, {
                    text: "❌ *DeepAI no pudo mejorar la imagen.*"
                });
            }

            // ============================
            //    DESCARGAR LA IMAGEN HD
            // ============================
            const improvedBuffer = await fetch(data.output_url).then(r => r.arrayBuffer());

            await sock.sendMessage(jid, {
                image: Buffer.from(improvedBuffer),
                caption: "✨ *Imagen mejorada en HD.*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "❌ *Hubo un error al procesar tu imagen.*"
            });
        }
    }
};
