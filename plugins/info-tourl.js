export default {
    commands: ["tourl"],
    help: ["tourl"],
    tags: ["tools"],

    run: async (sock, msg, args, ctx) => {
        try {
            const jid = msg.key.remoteJid;

            // Mensaje citado
            const quoted = msg.quoted;

            if (!quoted || !quoted.message || !quoted.message.imageMessage) {
                return sock.sendMessage(jid, { text: "📸 Responde a una *imagen* para convertir a URL." });
            }

            // ↓↓↓ ESTA FUNCIÓN SÍ EXISTE EN TU BASE ↓↓↓
            const buffer = await quoted.download();

            if (!buffer) {
                return sock.sendMessage(jid, { text: "❌ No pude descargar la imagen." });
            }

            sock.sendMessage(jid, { text: "⏳ Subiendo a ImgBB..." });

            const apiKey = "6d3b9f27859e88c0c7f387672d2dd4c9";

            // ImgBB requiere la imagen en BASE64
            let base64 = buffer.toString("base64");

            let res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    image: base64
                })
            });

            let json = await res.json();

            if (!json.success) {
                return sock.sendMessage(jid, { text: "❌ Error subiendo la imagen a ImgBB." });
            }

            let url = json.data.url;

            return sock.sendMessage(jid, { text: `✅ *URL generada:*\n${url}` });

        } catch (e) {
            console.log("ERROR TOUR:", e);
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Error procesando la imagen." });
        }
    }
};
