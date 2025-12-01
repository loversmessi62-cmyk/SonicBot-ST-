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

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen en HD...*" });

        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/caidas/swin2sr-realworld-sr-x4-64-bsrgan-psnr",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/octet-stream" },
                    body: buffer
                }
            );

            if (!response.ok) {
                return sock.sendMessage(jid, {
                    text: "⚠️ El servidor tardó en responder. Intenta más tarde."
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
