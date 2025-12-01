import fetch from "node-fetch";

export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // DESCARGAR IMAGEN
        let buffer;
        try {
            buffer = await ctx.download();
        } catch (err) {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen o envía una imagen directamente.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando imagen en HD...*" });

        try {
            // API GRATIS Y ESTABLE
            const response = await fetch("https://api.upscale.media/api/v1/upscale", {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                },
                body: buffer
            });

            const json = await response.json();

            if (!json || !json.output_url) {
                return sock.sendMessage(jid, { text: "❌ Error al mejorar la imagen." });
            }

            const hdImage = await fetch(json.output_url).then(res => res.arrayBuffer());

            await sock.sendMessage(jid, {
                image: Buffer.from(hdImage),
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);
            return sock.sendMessage(jid, {
                text: "❌ Ocurrió un error al procesar la imagen."
            });
        }
    }
};
