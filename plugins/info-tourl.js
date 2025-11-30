import axios from "axios";
import FormData from "form-data";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["tourl", "cachtbox", "cbx"],
    description: "Herramientas: convertir media a URL y subir texto a paste.",

    run: async (sock, msg, args, ctx) => {
        const command = args.shift()?.toLowerCase() || ctx.msg.body?.split(" ")[0].replace(".", "");

        // ============================
        //      📌 COMANDO: .tourl
        // ============================
        if (command === "tourl") {
            try {
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;

                const type = Object.keys(quoted)[0];

                if (!["imageMessage", "videoMessage", "audioMessage", "stickerMessage"].includes(type)) {
                    return sock.sendMessage(ctx.jid, {
                        text: "📌 *Envía o responde a una imagen/video/audio/sticker con:* .tourl"
                    });
                }

                // DESCARGAR MEDIA CORRECTAMENTE
                const buffer = await downloadMediaMessage(
                    { message: quoted },
                    "buffer"
                );

                // SUBIR A CACHBOX
                const form = new FormData();
                form.append("file", buffer, {
                    filename: "media",
                    contentType: "application/octet-stream"
                });

                const upload = await axios.post(
                    "https://cachbox.com/api/upload",
                    form,
                    { headers: form.getHeaders() }
                );

                const url = upload.data?.url;

                return sock.sendMessage(ctx.jid, {
                    text: `✅ *Archivo subido correctamente:*\n${url}`
                });

            } catch (e) {
                console.error("Error en .tourl:", e);
                return sock.sendMessage(ctx.jid, { text: "❌ Error subiendo el archivo..." });
            }
        }

        // ============================
        //   📌 COMANDO: .cachtbox / .cbx
        // ============================
        if (command === "cachtbox" || command === "cbx") {
            try {
                const texto =
                    args.join(" ") ||
                    msg.message?.extendedTextMessage?.text;

                if (!texto) {
                    return sock.sendMessage(ctx.jid, {
                        text: "📌 *Ejemplo:* .cachtbox console.log('Hola');"
                    });
                }

                const res = await axios.post(
                    "https://hastebin.com/documents",
                    texto,
                    { headers: { "Content-Type": "text/plain" } }
                );

                const url = `https://hastebin.com/${res.data.key}`;

                return sock.sendMessage(ctx.jid, {
                    text: `📄 *Texto subido:*\n${url}`
                });

            } catch (e) {
                console.error("Error en cachtbox:", e);
                return sock.sendMessage(ctx.jid, { text: "❌ Error subiendo el texto." });
            }
        }
    }
};
