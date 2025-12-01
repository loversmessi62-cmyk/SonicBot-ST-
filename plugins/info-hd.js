export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // DESCARGAR IMAGEN DESDE ctx (tu handler SÍ lo tiene)
        let buffer;
        try {
            buffer = await ctx.download();
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen para mejorarla en HD.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen en HD...*" });

        try {
            // FormData nativo (Node 18+)
            const form = new FormData();
            form.append("image_file", new Blob([buffer]), "photo.jpg");

            // API ESTABLE sin key
            const res = await fetch("https://api.upscalepics.com/images/upscale", {
                method: "POST",
                body: form
            });

            const json = await res.json();

            if (!json || !json.output_image_url) {
                return sock.sendMessage(jid, {
                    text: "❌ No se pudo mejorar la imagen."
                });
            }

            const hdResponse = await fetch(json.output_image_url);
            const hdArray = await hdResponse.arrayBuffer();
            const hdBuffer = Buffer.from(hdArray);

            await sock.sendMessage(jid, {
                image: hdBuffer,
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "❌ Error al procesar la imagen."
            });
        }
    }
};
