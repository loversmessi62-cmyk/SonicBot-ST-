export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // Descargar la imagen real
        let buffer;
        try {
            buffer = await ctx.download();
        } catch {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen para mejorarla.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen en HD (modo gratis)...*" });

        try {
            // ================================
            //   ENVIAR A HUGGINGFACE (FREE)
            // ================================
            const response = await fetch(
                "https://api-inference.huggingface.co/models/eugenesiow/biggan-super-resolution",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream"
                    },
                    body: buffer
                }
            );

            // Si el modelo está cargando
            if (response.status === 503) {
                return sock.sendMessage(jid, {
                    text: "⏳ *El servidor está cargando el modelo, intenta de nuevo en unos segundos.*"
                });
            }

            const arrayBuffer = await response.arrayBuffer();
            const improved = Buffer.from(arrayBuffer);

            // Enviar imagen resultante
            await sock.sendMessage(jid, {
                image: improved,
                caption: "✨ *Imagen mejorada en HD — FREE MODE*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "❌ *Error al procesar la imagen.*"
            });
        }
    }
};
