import fetch from "node-fetch";

export default {
    command: ["hd", "upscale", "enhance"],
    description: "Mejora la calidad de una imagen usando DeepAI",
    
    async run(sock, msg, args) {
        try {
            const q = msg.message?.imageMessage || msg.quoted?.imageMessage;
            if (!q) return sock.sendMessage(msg.key.remoteJid, { text: "📸 *Responde a una imagen con:* .hd" });

            // Descargar imagen original
            const buffer = await sock.downloadMediaMessage(msg.quoted || msg);

            // Enviar a DeepAI
            const response = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: {
                    "Api-Key": "f34fd260-0a46-4e06-be83-77c41d7d2e07"
                },
                body: {
                    image: buffer
                }
            });

            const result = await response.json();
            if (!result.output_url) {
                console.log(result);
                return sock.sendMessage(msg.key.remoteJid, { text: "❌ Error al mejorar la imagen." });
            }

            // Descargar el resultado
            const imgHD = await fetch(result.output_url).then(r => r.buffer());

            // Enviar HD
            await sock.sendMessage(msg.key.remoteJid, { image: imgHD, caption: "✨ Imagen mejorada en HD." });

        } catch (e) {
            console.log("Error en HD:", e);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ Ocurrió un error procesando la imagen." });
        }
    }
}
