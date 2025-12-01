import FormData from "form-data";

export default {
    command: ["hd", "upscale", "enhance"],

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        try {
            // Validar imagen
            if (!ctx.isImage && !ctx.isQuotedImage) {
                return sock.sendMessage(jid, {
                    text: "📸 Responde a una imagen con *.hd*"
                });
            }

            // Descargar la imagen
            const buffer = await ctx.download().catch(() => null);

            if (!buffer) {
                return sock.sendMessage(jid, {
                    text: "❌ No pude descargar la imagen."
                });
            }

            // Crear formdata
            const form = new FormData();
            form.append("image", buffer, {
                filename: "photo.jpg"
            });

            // Petición a DeepAI
            const res = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: {
                    "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07"
                },
                body: form
            });

            const json = await res.json();

            if (!json.output_url) {
                return sock.sendMessage(jid, {
                    text: "❌ La API no devolvió imagen HD."
                });
            }

            // Descargar imagen procesada
            const hd = await fetch(json.output_url)
                .then(r => r.arrayBuffer())
                .then(buf => Buffer.from(buf));

            // Enviar imagen HD
            await sock.sendMessage(jid, {
                image: hd,
                caption: "✨ Imagen mejorada a HD."
            });

        } catch (e) {
            console.log("❌ ERROR EN PLUGIN .HD:", e);
            await sock.sendMessage(jid, {
                text: "❌ Ocurrió un error procesando la imagen."
            });
        }
    }
};
