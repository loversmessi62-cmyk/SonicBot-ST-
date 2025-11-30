import axios from "axios";
import FormData from "form-data";

export default {
    commands: ["tourl", "cachtbox", "cbx"],
    description: "Herramientas: convertir media a URL y subir texto a paste.",

    run: async (sock, msg, args, ctx) => {
        const command = args.shift()?.toLowerCase() || ctx.msg.body?.split(" ")[0].replace(".", "");

        // ============================
        //     📌 COMANDO: .tourl
        // ============================
        if (command === "tourl") {
            try {
                const type = Object.keys(msg.message)[0];

                if (!["imageMessage", "videoMessage", "audioMessage", "stickerMessage"].includes(type)) {
                    return sock.sendMessage(ctx.jid, {
                        text: "📌 *Envía o responde a una imagen/video/audio/sticker con:* .tourl"
                    });
                }

                // Descargar buffer con tu ctx FIX
                const buffer = await ctx.download();

                const form = new FormData();
                form.append("file", buffer, "media");

                const upload = await axios.post("https://telegra.ph/upload", form, {
                    headers: form.getHeaders()
                });

                const url = "https://telegra.ph" + upload.data[0].src;

                return sock.sendMessage(ctx.jid, {
                    text: `✅ *Media subido con éxito:*\n${url}`
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
