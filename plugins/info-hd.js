export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // DESCARGA DE IMAGEN
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
            const response = await fetch(
                "https://api-inference.huggingface.co/models/TencentARC/Real-ESRGAN",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/octet-stream" },
                    body: buffer
                }
            );

            // SI TARDA MUCHO
            if (response.status === 503) {
                return sock.sendMessage(jid, {
                    text: "⚠️ El modelo se está iniciando. Intenta de nuevo en 5 segundos."
                });
            }

            if (!response.ok) {
                return sock.sendMessage(jid, {
                    text: "❌ Error del servidor. Intenta más tarde."
                });
            }

            const improvedBuffer = Buffer.from(await response.arrayBuffer());

            await sock.sendMessage(jid, {
                image: improvedBuffer,
                caption: "✨ *Imagen mejorada en HD (Real-ESRGAN)*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "❌ Ocurrió un error al procesar la imagen."
            });
        }
    }
};
