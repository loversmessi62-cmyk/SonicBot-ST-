import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fetch from "node-fetch";

export default {
    commands: ["tourl"],
    help: ["tourl"],
    tags: ["tools"],

    run: async (sock, msg) => {
        try {
            const jid = msg.key.remoteJid;

            // Tomamos el mensaje citado
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted || !quoted.imageMessage) {
                return sock.sendMessage(jid, { text: "📸 Responde a una *imagen* para convertirla a URL." });
            }

            // Descargar imagen desde el mensaje real
            const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            sock.sendMessage(jid, { text: "⏳ Subiendo a ImgBB..." });

            const base64 = buffer.toString("base64");
            const apiKey = "6d3b9f27859e88c0c7f387672d2dd4c9";

            const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ image: base64 })
            });

            const json = await res.json();

            if (!json.success) {
                return sock.sendMessage(jid, { text: "❌ Error subiendo la imagen." });
            }

            return sock.sendMessage(jid, {
                text: `✅ *URL generada:*\n${json.data.url}`
            });

        } catch (e) {
            console.log("ERROR TOUR:", e);
            return sock.sendMessage(msg.key.remoteJid, {
                text: "❌ No pude procesar la imagen."
            });
        }
    }
};
