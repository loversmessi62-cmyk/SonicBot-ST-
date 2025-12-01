export default {
    command: ["hd", "upscale", "enhance"],
    description: "Mejora la calidad de una imagen usando DeepAI",

    async run(sock, msg) {
        try {
            const jid = msg.key.remoteJid;

            // Busca imagen citada o normal
            const q = msg.message?.imageMessage || msg.quoted?.imageMessage;
            if (!q) {
                return sock.sendMessage(jid, { text: "📸 *Envía o responde a una imagen con:* .hd" });
            }

            // Descargar imagen
            const buffer = await sock.downloadMediaMessage(msg.quoted || msg);

            // Preparar FormData (undici)
            const fd = new FormData();
            fd.append("image", new Blob([buffer]), "image.jpg");

            // Llamada al endpoint de DeepAI
            const r = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: {
                    "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07"
                },
                body: fd
            });

            const j = await r.json();
            if (!j.output_url) {
                console.log(j);
                return sock.sendMessage(jid, { text: "❌ No se pudo mejorar la imagen." });
            }

            // Descargar imagen HD
            const imgHD = await fetch(j.output_url).then(res => res.arrayBuffer());

            // Enviar
            await sock.sendMessage(jid, {
                image: Buffer.from(imgHD),
                caption: "✨ Imagen mejorada en HD."
            });

        } catch (e) {
            console.log("Error en HD:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error procesando la imagen."
            });
        }
    }
};
