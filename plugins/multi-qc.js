import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export default {
    commands: ["qc", "quote"],
    category: "fun",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const text = args.join(" ");

        if (!text)
            return sock.sendMessage(jid, { text: "✏️ Escribe un texto para el QC.\nEjemplo:\n.qc Hola soy AdriBot" }, { quoted: msg });

        // Crear carpeta tmp interna del bot
        const tmpDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const avatarPath = path.join(tmpDir, `avatar-${Date.now()}.jpg`);
        const jsonPath = path.join(tmpDir, `qc-${Date.now()}.json`);
        const outPath = path.join(tmpDir, `qc-${Date.now()}.png`);

        try {
            // Avatar
            const ppUrl = await sock.profilePictureUrl(sender, "image").catch(_ => null);

            if (ppUrl) {
                const axios = (await import("axios")).default;
                const res = await axios.get(ppUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(avatarPath, res.data);
            }

            // JSON para QC
            const qcData = {
                type: "quote",
                format: "png",
                backgroundColor: "#000000",
                width: 700,
                height: 600,
                scale: 3,
                messages: [
                    {
                        avatar: ppUrl ? avatarPath : "",
                        from: {
                            name: ctx.pushName || "Usuario",
                            text_color: "#ffffff",
                            font: "Roboto"
                        },
                        text: text,
                        reply_message: {},
                        watermark: "Hecho por ADRIBOT"
                    }
                ]
            };

            fs.writeFileSync(jsonPath, JSON.stringify(qcData));

            // Ejecutar ffmpeg
            await new Promise((resolve, reject) => {
                const ff = spawn("ffmpeg", ["-i", jsonPath, outPath]);
                ff.on("close", code => code === 0 ? resolve() : reject("FFmpeg error"));
            });

            // Enviar como sticker
            await sock.sendMessage(jid, { sticker: { url: outPath } }, { quoted: msg });

            // Limpiar
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
            fs.unlinkSync(jsonPath);
            fs.unlinkSync(outPath);

        } catch (e) {
            console.log("Error QC:", e);
            return sock.sendMessage(jid, { text: "❌ Error al generar QC." }, { quoted: msg });
        }
    }
};
