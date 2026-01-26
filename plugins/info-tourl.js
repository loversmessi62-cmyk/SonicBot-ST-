import axios from "axios";
import FormData from "form-data";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["tourl", "upload", "cbx"],
    category: "info",
    description: "Sube imagen/video/documento a RussellXZ y devuelve URL",

    async run(sock, msg, args, ctx = {}) {
        const jid = ctx.jid || msg.key.remoteJid;

        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMsg = quotedMsg ? { message: quotedMsg } : msg;

        const t = targetMsg.message ? Object.keys(targetMsg.message)[0] : null;
        const mime =
            targetMsg.message?.imageMessage?.mimetype ||
            targetMsg.message?.videoMessage?.mimetype ||
            targetMsg.message?.documentMessage?.mimetype ||
            targetMsg.message?.audioMessage?.mimetype ||
            null;

        if (!t || !mime) {
            return sock.sendMessage(jid, {
                text: "📌 Responde o envía una imagen/video/documento y usa: .tourl"
            });
        }

        async function getBuffer() {
            if (ctx?.download && typeof ctx.download === "function") {
                try {
                    const b = await ctx.download();
                    if (b) return b;
                } catch (e) {}
            }

            if (typeof sock.downloadMediaMessage === "function") {
                try {
                    const maybe = await sock.downloadMediaMessage(targetMsg);
                    if (maybe) return maybe;
                } catch (e) {}
            }

            try {
                const content = targetMsg.message[t];
                const contentType = t.replace("Message", "").toLowerCase();
                const stream = await downloadContentFromMessage(content, contentType);

                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            } catch (e) {
                console.error("❌ Fallback download falló:", e);
                return null;
            }
        }

        let buffer;
        try {
            buffer = await getBuffer();
        } catch (e) {
            buffer = null;
        }

        if (!buffer) {
            return sock.sendMessage(jid, {
                text: "❌ No pude descargar el archivo (intenté varios métodos)."
            });
        }

        const ext = mime.split("/")[1]?.split(";")[0] || "bin";
        const filename = `file.${ext}`;

        try {
            const form = new FormData();
            form.append("file", new Blob([buffer], { type: mime }), filename);

            const res = await axios.post("https://cdn.russellxz.click/upload.php", form, {
                headers: form.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const url = res.data?.url;

            if (!url) {
                throw new Error("Respuesta inválida de RussellXZ: " + JSON.stringify(res.data));
            }

            return sock.sendMessage(jid, {
                text: `✅ *Archivo subido con éxito*\n🔗 ${url}`
            });

        } catch (err) {
            console.error("❌ Error subiendo a RussellXZ:", err?.response?.data || err.message || err);
            return sock.sendMessage(jid, { text: `❌ Error subiendo el archivo a RussellXZ.\n${err.message}` });
        }
    }
};