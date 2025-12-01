import Replicate from "replicate";

export default {
    commands: ["hd"],
    description: "Mejora la calidad de una imagen",
    
    async run(sock, msg, args, ctx) {
        try {
            const replicate = new Replicate({
                auth: "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF"
            });

            if (!msg.message.imageMessage)
                return sock.sendMessage(msg.key.remoteJid, { text: "❌ Debes responder a una imagen." });

            const buffer = await downloadContentFromMessage(msg.message.imageMessage, "image");
            const chunks = [];
            for await (const chunk of buffer) chunks.push(chunk);
            const imageData = Buffer.concat(chunks);

            const output = await replicate.run(
                "lucataco/real-esrgan:latest",
                {
                    input: {
                        image: `data:image/png;base64,${imageData.toString("base64")}`
                    }
                }
            );

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: output },
                caption: "✔️ Imagen mejorada en HD"
            });

        } catch (e) {
            console.error("ERROR HD:", e);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Error al procesar la imagen." });
        }
    }
};
