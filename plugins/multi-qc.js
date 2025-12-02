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
            return sock.sendMessage(jid, { text: "✏️ Escribe un texto para hacer el *QC*\n\nEjemplo:\n.qc Hola soy AdriBot" }, { quoted: msg });

        // Datos del usuario
        const name = ctx.pushName || "Usuario";
        const avatarPath = `/storage/emulated/0/ADRI-BOT/tmp/avatar-${Date.now()}.jpg`;

        try {
            // Descargar avatar
            const ppUrl = await sock.profilePictureUrl(sender, "image").catch(_ => null);

            if (ppUrl) {
                const axios = (await import("axios")).default;
                const res = await axios.get(ppUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(avatarPath, res.data);
            }

            // JSON del QC
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
                            name: name,
                            text_color: "#ffffff",
                            font: "Roboto"
                        },
                        text: text,
                        reply_message: {},
                        watermark: "Hecho por ADRIBOT"
                    }
                ]
            };

            // Guardar JSON temporal
            const jsonPath = `/storage/emulated/0/ADRI-BOT/tmp/qc-${Date.now()}.json`;
            fs.writeFileSync(jsonPath, JSON.stringify(qcData));

            // Salida del QC
            const outPath = `/storage/emulated/0/ADRI-BOT/tmp/qc-${Date.now()}.png`;

            // Ejecutar ffmpeg (Termux ya lo trae)
            await new Promise((resolve, reject) => {
                const process = spawn("ffmpeg", [
                    "-i", jsonPath,
                    outPath
                ]);

                process.on("close", code => {
                    if (code === 0) resolve();
                    else reject("FFmpeg error");
                });
            });

            // Enviar como sticker
            await sock.sendMessage(jid, {
                sticker: {
                    url: outPath
                }
            }, { quoted: msg });

            // Limpiar archivos
            fs.unlinkSync(jsonPath);
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
            fs.unlinkSync(outPath);

        } catch (e) {
            console.log("Error QC:", e);
            return sock.sendMessage(jid, { text: "❌ Error al generar el QC." }, { quoted: msg });
        }
    }
};
