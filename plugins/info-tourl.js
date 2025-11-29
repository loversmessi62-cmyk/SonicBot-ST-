/**
 * plugins/info-tourl.js
 *
 * Requisitos:
 *  - npm i axios
 *
 * Uso:
 *  - Responde una imagen/video/sticker con .tourl
 *  - O escribe: .tourl https://i.imgur.com/xxx.jpg
 *
 * Nota: Pega tu Client ID de Imgur en IMGUR_CLIENT_ID abajo.
 */

import axios from "axios";

const IMGUR_CLIENT_ID = "TU_CLIENT_ID_IMGUR"; // <--- pon aquí tu Client ID (recomendado)

async function streamToBuffer(stream) {
    // convierte un ReadableStream/node stream a Buffer
    const chunks = [];
    for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return Buffer.concat(chunks);
}

export default {
    commands: ["tourl", "imgurl", "upload"],
    description: "Sube imagen/video/sticker a Imgur y devuelve link corto (responde media con .tourl)",
    admin: false,

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        try {
            // 1) Si pasaron una URL directa por argumento -> la devolvemos tal cual (si es válida)
            if (args && args[0]) {
                const url = args[0].trim();
                // si termina en extensión de imagen/video, devolverla (o intentar validar)
                if (/\.(jpe?g|png|gif|webp|mp4)(\?.*)?$/i.test(url)) {
                    return await sock.sendMessage(jid, { text: `🔗 LINK: ${url}` }, { quoted: msg });
                }
                // si no es directa, intentaremos descargarla igualmente
            }

            // 2) Obtener el mensaje citado (media)
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
                || msg.message?.imageMessage
                || msg.message?.videoMessage
                || msg.message?.stickerMessage
                || null;

            if (!quoted && !(args && args[0])) {
                return await sock.sendMessage(jid, { text: "📌 Responde una imagen/video/sticker con: .tourl ó escribe .tourl <url_directa>" }, { quoted: msg });
            }

            // 3) Si hay quoted -> intentar obtener Buffer de distintas formas
            let buffer = null;

            if (quoted) {
                // primer intento: usar la API interna del sock (si existe)
                try {
                    if (typeof sock.downloadMediaMessage === "function") {
                        // algunas forks/versions usan downloadMediaMessage
                        const res = await sock.downloadMediaMessage({ message: quoted });
                        if (res) buffer = res;
                    }
                } catch (e) {
                    // ignore y probar otro método
                }

                // segundo intento: usar downloadContentFromMessage de baileys (import dinámico)
                if (!buffer) {
                    try {
                        const baileys = await import("@whiskeysockets/baileys");
                        if (baileys && typeof baileys.downloadContentFromMessage === "function") {
                            // determinar tipo
                            const mtype = Object.keys(quoted)[0]; // ex: imageMessage, videoMessage, stickerMessage
                            const mediaType = mtype?.includes("image") ? "image" : (mtype?.includes("video") ? "video" : "image");
                            const stream = await baileys.downloadContentFromMessage(quoted, mediaType);
                            buffer = await streamToBuffer(stream);
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                // tercer intento: si quoted tiene url/directPath en message (some payloads)
                if (!buffer) {
                    try {
                        const maybeUrl =
                            quoted.imageMessage?.url ||
                            quoted.videoMessage?.url ||
                            quoted.stickerMessage?.url ||
                            quoted.imageMessage?.directPath ||
                            quoted.videoMessage?.directPath;

                        if (maybeUrl) {
                            const fetchRes = await axios.get(maybeUrl, { responseType: "arraybuffer" });
                            buffer = Buffer.from(fetchRes.data);
                        }
                    } catch (e) {
                        // ignore
                    }
                }
            }

            // 4) Si aún no tenemos buffer y se pasó una URL por args -> descargarla
            if (!buffer && args && args[0]) {
                try {
                    const url = args[0].trim();
                    const res = await axios.get(url, { responseType: "arraybuffer" });
                    buffer = Buffer.from(res.data);
                } catch (e) {
                    // ignore
                }
            }

            if (!buffer) {
                return await sock.sendMessage(jid, { text: "❌ No pude obtener el archivo. Intenta reenviar la media o usa una URL directa que termine en .jpg/.png/.mp4" }, { quoted: msg });
            }

            // 5) SI TIENES IMGUR CLIENT ID -> subir a Imgur y devolver link corto
            if (IMGUR_CLIENT_ID && IMGUR_CLIENT_ID !== "TU_CLIENT_ID_IMGUR") {
                try {
                    const res = await axios.post("https://api.imgur.com/3/image", buffer.toString("base64"), {
                        headers: {
                            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                            "Content-Type": "application/json"
                        },
                        // body must be form data or JSON with "image" base64; axios with JSON:
                        data: { image: buffer.toString("base64"), type: "base64" },
                    });

                    // NOTE: above may not send correctly because Imgur expects form-data; use fallback below
                } catch (e) {
                    // ignore and use proper form-data approach below
                }

                // proper form-data method:
                try {
                    const FormData = (await import("form-data")).default;
                    const form = new FormData();
                    form.append("image", buffer.toString("base64"));
                    const upload = await axios.post("https://api.imgur.com/3/image", form, {
                        headers: {
                            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                            ...form.getHeaders()
                        },
                        maxBodyLength: Infinity
                    });

                    if (upload?.data?.data?.link) {
                        const link = upload.data.data.link; // ejemplo: https://i.imgur.com/xxxx.jpg
                        return await sock.sendMessage(jid, { text: `🔗 LINK (Imgur):\n${link}` }, { quoted: msg });
                    }
                } catch (err) {
                    console.error("Err Imgur upload:", err?.response?.data || err.message || err);
                    // si falla Imgur, seguimos abajo intentando devolver CDN link si existe
                }
            }

            // 6) Si no tenemos Imgur o subida falló -> intentar reenviar media para obtener link directo CDN (WhatsApp)
            try {
                // reenviamos el buffer como imagen al mismo chat, WhatsApp retornará un message obj con imageMessage.directPath
                const sent = await sock.sendMessage(jid, { image: buffer, caption: "🔁 Generando link..." });
                // obtener path
                const directPath = sent?.message?.imageMessage?.directPath || sent?.message?.documentMessage?.directPath;
                if (directPath) {
                    const url = `https://mmg.whatsapp.net${directPath}`;
                    return await sock.sendMessage(jid, { text: `🔗 LINK (WA CDN):\n${url}` }, { quoted: msg });
                }
            } catch (e) {
                // ignore
            }

            // 7) Si todo falla, responde con mensaje de error
            return await sock.sendMessage(jid, { text: "❌ No fue posible subir el archivo a Imgur ni obtener link CDN. Intenta con otra imagen o configura IMGUR_CLIENT_ID." }, { quoted: msg });

        } catch (err) {
            console.error("TOURL ERROR:", err);
            await sock.sendMessage(jid, { text: "❌ Error interno al procesar .tourl. Reintenta." }, { quoted: msg });
        }
    }
};
