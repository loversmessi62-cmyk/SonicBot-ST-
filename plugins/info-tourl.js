export default {
    commands: ["tourl"],
    help: ["tourl"],
    tags: ["tools"],

    run: async (sock, msg, args, ctx) => {
        try {
            const jid = msg.key.remoteJid;

            // Si responde a un mensaje
            let q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            let mime = null;
            let buffer = null;

            // Detectar imagen citada
            if (q?.imageMessage) {
                mime = q.imageMessage.mimetype;
                buffer = await msg.quoted.download();
            }

            // Detectar imagen enviada directamente
            else if (msg.message?.imageMessage) {
                mime = msg.message.imageMessage.mimetype;
                buffer = await sock.downloadMediaMessage(msg);
            }

            if (!buffer) {
                return sock.sendMessage(jid, { text: "📸 Envía o responde a una *imagen*." });
            }

            sock.sendMessage(jid, { text: "⏳ Subiendo imagen..." });

            const apiKey = "6d3b9f27859e88c0c7f387672d2dd4c9";

            let res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    image: buffer.toString("base64")
                })
            });

            let json = await res.json();

            if (!json.success) {
                return sock.sendMessage(jid, { text: "❌ Error subiendo imagen." });
            }

            sock.sendMessage(jid, { text: `✅ URL generada:\n${json.data.url}` });

        } catch (e) {
            console.log("ERROR TOUR:", e);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Error procesando la imagen." });
        }
    }
};
