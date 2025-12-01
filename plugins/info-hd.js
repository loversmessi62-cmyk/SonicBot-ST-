const Replicate = require("replicate");

module.exports = {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid;

        // DESCARGAR IMAGEN
        let buffer;
        try {
            buffer = await ctx.download();
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen o envía una imagen directamente.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando en HD... espera un momento.*" });

        try {
            const replicate = new Replicate({
                auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
            });

            // Convertir imagen a base64
            const base64Image = "data:image/jpeg;base64," + buffer.toString("base64");

            // Ejecutar modelo Real-ESRGAN
            const output = await replicate.run(
                "cjwbw/real-esrgan",   // modelo compatible con base64
                {
                    input: {
                        image: base64Image,
                        scale: 4
                    }
                }
            );

            // output = URL directa
            await sock.sendMessage(jid, {
                image: { url: output },
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (err) {
            console.log("ERROR HD:", err);
            return sock.sendMessage(jid, { text: "❌ Error al procesar la imagen." });
        }
    }
};
