import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { FormData, Blob } from "formdata-node";

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
            const blob = new Blob([buffer], { type: mime });
            form.append("file", blob, filename);

            const res = await fetch("https://cdn.russellxz.click/upload.php", {
                method: "POST",
                body: form,
            });

            const result = await res.json();

            if (res.ok && result?.url) {
                return sock.sendMessage(jid, {
                    text: `✅ *Archivo subido con éxito*\n🔗 ${result.url}`
                });
            } else {
                throw new Error(result?.error || 'Error en la carga a RussellXZ');
            }

        } catch (err) {
            console.error("❌ Error subiendo a RussellXZ:", err?.message || err);
            return sock.sendMessage(jid, { text: `❌ Error subiendo el archivo a RussellXZ./n${err.message}` });
        }
    }
};