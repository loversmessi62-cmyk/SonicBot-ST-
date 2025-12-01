import fetch from "node-fetch";
import FormData from "form-data";

export default {
    commands: ["hd", "info-hd"],
    admin: false,
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // Intentar descargar imagen
        let buffer;
        try {
            buffer = await ctx.download(); // ACTIVA LA DETECCIÓN REAL
        } catch (e) {
            return sock.sendMessage(jid, {
                text: "❌ *Responde a una imagen para mejorarla.*"
            });
        }

        await sock.sendMessage(jid, { text: "⏳ *Mejorando calidad... espera...*" });

        try {
            const form = new FormData();
            form.append("image", buffer, { filename: "input.jpg" });

            const r = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: {
                    "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07"
                },
                body: form
            });

            const json = await r.json();

            if (!json.output_url) {
                return sock.sendMessage(jid, {
                    text: "❌ No se pudo mejorar la imagen."
                });
            }

            const improved = await fetch(json.output_url).then(r => r.arrayBuffer());

            await sock.sendMessage(jid, {
                image: Buffer.from(improved),
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (err) {
            console.error("ERROR HD:", err);

            return sock.sendMessage(jid, {
                text: "❌ Ocurrió un error procesando la imagen."
            });
        }
    }
};
