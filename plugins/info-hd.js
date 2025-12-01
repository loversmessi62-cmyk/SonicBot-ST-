export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // ======================================
        //     DESCARGAR IMAGEN CORRECTAMENTE
        // ======================================
        let buffer;
        try {
            buffer = await ctx.download();
        } catch {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen para mejorarla.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen en HD...*" });

        try {

            // ===============================
            //  ARMAR FORM DATA SIN LIBRERÍAS
            // ===============================
            const form = new FormData();
            form.append("image", new Blob([buffer]), "input.jpg");

            // ===============================
            //        PETICIÓN A DEEPAI
            // ===============================
            const r = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: {
                    "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07"
                },
                body: form
            });

            const json = await r.json();

            if (!json.output_url) {
                console.log("DeepAI Response:", json);
                return sock.sendMessage(jid, {
                    text: "❌ *No se pudo mejorar la imagen.*"
                });
            }

            // ===============================
            //   DESCARGAR LA IMAGEN RESULTADO
            // ===============================
            const improvedBuffer = Buffer.from(
                await fetch(json.output_url).then(res => res.arrayBuffer())
            );

            await sock.sendMessage(jid, {
                image: improvedBuffer,
                caption: "✨ *Imagen mejorada en HD.*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "❌ *Error al procesar la imagen.*"
            });
        }
    }
};
