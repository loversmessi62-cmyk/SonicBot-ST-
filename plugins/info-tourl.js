import axios from "axios";
import FormData from "form-data";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["tourl", "upload", "cbx"],
    category: "info",
    description: "Sube imagen/video/documento a Catbox y devuelve URL",

    async run(sock, msg, args, ctx = {}) {
        const jid = ctx.jid || msg.key.remoteJid;

        // 1) obtener el mensaje objetivo: citado o el propio
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMsg = quotedMsg ? { message: quotedMsg } : msg;

        // 2) tipo / mimetype (intento)
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

        // 3) función robusta para obtener buffer
        async function getBuffer() {
            // si el handler ya te da ctx.download (ideal), úsalo
            if (ctx?.download && typeof ctx.download === "function") {
                try {
                    const b = await ctx.download();
                    if (b) return b;
                } catch (e) { /* ignore and try other ways */ }
            }

            // si sock tiene downloadMediaMessage (algunas wrappers lo exponen)
            if (typeof sock.downloadMediaMessage === "function") {
                try {
                    // algunos require { message: targetMsg.message } y otros aceptan message directo
                    const maybe = await sock.downloadMediaMessage(targetMsg);
                    if (maybe) return maybe;
                } catch (e) { /* ignore and fallback */ }
            }

            // fallback: downloadContentFromMessage de baileys
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

        // 4) descargar
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

        // 5) calcular extensión por mime
        const ext = mime.split("/")[1]?.split(";")[0] || "bin";
        const filename = `file.${ext}`;

        // 6) subir a Catbox
        try {
            const form = new FormData();
            form.append("reqtype", "fileupload");
            // En node, FormData acepta Buffer + filename
            form.append("fileToUpload", buffer, { filename });

            const res = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders ? form.getHeaders() : { ...form.getHeaders },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const url = res.data; // catbox devuelve solo la URL en texto

            if (!url || typeof url !== "string") {
                throw new Error("Respuesta inválida de Catbox: " + JSON.stringify(res.data));
            }

            return sock.sendMessage(jid, {
                text: `✅ *Archivo subido con éxito*\n🔗 ${url}`
            });

        } catch (err) {
            console.error("❌ Error subiendo a Catbox:", err?.response?.data || err.message || err);
            return sock.sendMessage(jid, { text: "❌ Error subiendo el archivo a Catbox." });
        }
    }
};
