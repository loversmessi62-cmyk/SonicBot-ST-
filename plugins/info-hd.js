export default {
    command: ["hd", "upscale", "enhance"],
    description: "Mejora la calidad de una imagen usando DeepAI",

    async run(sock, msg) {
        try {
            const jid = msg.key.remoteJid;

            // Detectar imagen enviada o citada
            let imgMsg =
                msg.message?.imageMessage ||
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

            if (!imgMsg) {
                await sock.sendMessage(jid, { text: "📸 *Envía o responde a una imagen con:* .hd" });
                return;
            }

            // Descargar imagen
            const buffer = await sock.downloadMediaMessage({
                message: { imageMessage: imgMsg }
            });

            // Crear FormData (undici nativo)
            const fd = new FormData();
            fd.append("image", new Blob([buffer]), "photo.jpg");

            // Llamada API
            const r = await fetch("https://api.deepai.org/api/torch-srgan", {
                method: "POST",
                headers: {
                    "api-key": "f34fd260-0a46-4e06-be83-77c41d7d2e07"
                },
                body: fd
            });

            const j = await r.json();

            if (!j.output_url) {
                return sock.sendMessage(jid, {
                    text: "❌ No se pudo mejorar la imagen."
                });
            }

            // Descargar imagen HD
            const hd = await fetch(j.output_url).then(res => res.arrayBuffer());

            // Enviar al chat
            await sock.sendMessage(jid, {
                image: Buffer.from(hd),
                caption: "✨ Imagen mejorada en HD."
            });

        } catch (e) {
            console.log("ERROR EN PLUGIN .HD:", e);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error procesando la imagen."
            });
        }
    }
};
