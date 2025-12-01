import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["tourl"],
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(jid, { text: "📌 Responde a una imagen/video/audio/documento para convertirlo a link." });
        }

        // Detectar tipo
        const msgType = Object.keys(quoted)[0];
        const mediaMessage = quoted[msgType];

        const type = msgType.replace("Message", ""); // image → image
        const stream = await downloadContentFromMessage(mediaMessage, type);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Crear archivo temporal
        if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");
        const fileTemp = `./temp/${Date.now()}.bin`;
        fs.writeFileSync(fileTemp, buffer);

        // Subir a Catbox
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fs.createReadStream(fileTemp));

        let upload;
        try {
            upload = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders()
            });
        } catch (e) {
            return sock.sendMessage(jid, { text: "❌ Error subiendo a Catbox." });
        }

        // Eliminar archivo temporal
        fs.unlinkSync(fileTemp);

        // Enviar link final
        await sock.sendMessage(jid, {
            text: `✅ *LINK GENERADO:*\n${upload.data}`
        });
    }
};
