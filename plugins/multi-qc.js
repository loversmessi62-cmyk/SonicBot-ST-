import fs from "fs";
import path from "path";

export default {
    commands: ["qc"],

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        // Detectar si responde a un mensaje
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let texto = null;

        if (quoted?.conversation) {
            texto = quoted.conversation;
        }

        // Texto directo
        if (!texto && args.length > 0) {
            texto = args.join(" ");
        }

        // Si no recibimos texto
        if (!texto) {
            return sock.sendMessage(jid, {
                text: "❌ Debes responder a un texto o usar: .qc hola"
            }, { quoted: msg });
        }

        // Crear imagen PNG manual con Node
        const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="black"/>
            <text x="50%" y="50%" font-size="48" fill="white"
                  font-family="Arial" dominant-baseline="middle"
                  text-anchor="middle">${texto}</text>
        </svg>`;

        const buffer = Buffer.from(svg);

        // Guardar PNG temporal
        const filePath = path.join(process.cwd(), "qc.png");
        fs.writeFileSync(filePath, buffer);

        // Enviar sticker
        await sock.sendMessage(jid, {
            sticker: fs.readFileSync(filePath)
        }, { quoted: msg });

        // Borrar archivo temporal
        fs.unlinkSync(filePath);
    }
};
