import fetch from "node-fetch";
import FormData from "form-data";

export default {
    command: ["hd", "upscale", "enhance"],
    description: "Mejora la calidad de una imagen usando DeepAI",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        try {
            // Detectar si hay imagen o imagen citada
            if (!ctx.isImage && !ctx.isQuotedImage) {
                return sock.sendMessage(jid, { text: "📸 Responde a una imagen con: *.hd*" });
            }

            // Descargar imagen con tu handler
            const buffer = await ctx.download();
            if (!buffer) return sock.sendMessage(jid, { text: "❌ No pude descargar la imagen." });

            // Crear form-data
            const form = new FormData();
            form.append("image", buffer, "photo.jpg");

            // Petición a DeepAI
            const res = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: { "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07" },
                body: form
            });

            const json = await res.json();
            if (!json.output_url) {
                return sock.sendMessage(jid, { text: "❌ La API no devolvió la imagen HD." });
            }

            // Descargar imagen HD
            const hd = await fetch(json.output_url).then(r => r.buffer());

            // Enviar imagen resultante
            await sock.sendMessage(jid, {
                image: hd,
                caption: "✨ Imagen mejorada en HD."
            });

        } catch (e) {
            console.log("ERROR EN PLUGIN .HD:", e);
            await sock.sendMessage(jid, { text: "❌ Error procesando la imagen." });
        }
    }
};
