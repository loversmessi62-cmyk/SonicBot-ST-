export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // INTENTAR DESCARGAR IMAGEN
        let buffer;
        try {
            buffer = await ctx.download();
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen o envía una imagen directamente.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen en HD...*" });

        // API GRATIS DE HUGGINGFACE (SIN KEYS)
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/eugenesiow/biggan-super-resolution",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/octet-stream" },
                    body: buffer
                }
            );

            if (response.status === 503) {
                return sock.sendMessage(jid, {
                    text: "⚠️ Servidor cargando modelo. Intenta de nuevo en unos segundos."
                });
            }

            const improvedBuffer = Buffer.from(await response.arrayBuffer());

            await sock.sendMessage(jid, {
                image: improvedBuffer,
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
