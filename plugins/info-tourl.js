import { downloadMediaMessage } from "@whiskeysockets/baileys";
import axios from "axios";

const IMGUR_CLIENT_ID = "TU_CLIENT_ID_AQUI"; // <-- pega aquí tu Client ID

export default {
    commands: ["tourl"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(jid, {
                text: "📌 *Responde a una imagen con:* .tourl"
            });
        }

        // Convertir la imagen a buffer
        const buffer = await downloadMediaMessage(
            { message: quoted },
            "buffer",
            {},
            { logger: null }
        );

        // Subir a imgur
        const res = await axios.post(
            "https://api.imgur.com/3/image",
            {
                image: buffer.toString("base64"),
                type: "base64"
            },
            {
                headers: {
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
                }
            }
        );

        const url = res.data.data.link;

        await sock.sendMessage(jid, {
            text: `🔗 *LINK CORTO (IMGUR)*:\n${url}`
        });
    }
};
