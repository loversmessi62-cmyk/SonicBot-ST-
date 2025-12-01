import axios from "axios";
import fs from "fs";
import path from "path";

export default {
    commands: ["tourl"],
    category: "utilidad",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // Revisar si el mensaje trae archivo o es respuesta
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mime = ctx.mime;

        if (!mime && !quoted)
            return sock.sendMessage(jid, { text: "📌 Responde a una *imagen/video/audio/documento* para convertirlo en link." });

        // Obtener el tipo de media
        const msgType = Object.keys(quoted || msg.message).find(k => k.includes("Message"));
        const mediaMessage = quoted ? quoted[msgType] : msg.message[msgType];

        // Descargar archivo
        const buffer = await sock.downloadMediaMessage({ message: { [msgType]: mediaMessage } });

        // Guardar archivo temporal
        const tempName = Date.now() + ".tmp";
        const tempPath = path.join("./temp", tempName);
        if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

        fs.writeFileSync(tempPath, buffer);

        // Subir a Catbox
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fs.createReadStream(tempPath));

        let upload;
        try {
            upload = await axios.post("https://catbox.moe/user/api.php", form, {
                headers: form.getHeaders()
            });
        } catch (e) {
            return sock.sendMessage(jid, { text: "❌ Error subiendo a Catbox." });
        }

        // Eliminar archivo temporal
        fs.unlinkSync(tempPath);

        // Enviar link final
        await sock.sendMessage(jid, {
            text: `✅ Archivo subido:\n${upload.data}`
        });
    }
};
