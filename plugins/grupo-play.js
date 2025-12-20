import yts from "yt-search";
import axios from "axios";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { pipeline } from "stream";
import { promisify } from "util";
import { fileURLToPath } from "url";

const streamPipeline = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    commands: ["play"],
    category: "downloader",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const text = args.join(" ");

        if (!text) {
            return sock.sendMessage(jid, {
                text: "🎵 Usa el comando así:\n\n👉 *.play nombre de la canción*"
            }, { quoted: msg });
        }

        // Reacción cargando
        await sock.sendMessage(jid, {
            react: { text: "⏳", key: msg.key }
        });

        try {
            const search = await yts(text);
            if (!search.videos.length) {
                throw new Error("No encontré resultados.");
            }

            const video = search.videos[0];
            const {
                title,
                url,
                timestamp,
                views,
                author,
                thumbnail
            } = video;

            const info = `🎶 *${title}*

👤 Autor: ${author.name}
⏱️ Duración: ${timestamp}
👁️ Vistas: ${views.toLocaleString()}
🔗 ${url}

⏳ Descargando audio...`;

            await sock.sendMessage(jid, {
                image: { url: thumbnail },
                caption: info
            }, { quoted: msg });

            // ===== DESCARGA AUDIO =====
            const api = `https://p.oceansaver.in/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}`;
            const res = await axios.get(api);

            if (!res.data?.success) throw new Error("Error al obtener audio.");

            const id = res.data.id;

            let downloadUrl;
            while (true) {
                const progress = await axios.get(
                    `https://p.oceansaver.in/ajax/progress.php?id=${id}`
                );
                if (progress.data?.success && progress.data.progress === 1000) {
                    downloadUrl = progress.data.download_url;
                    break;
                }
                await new Promise(r => setTimeout(r, 3000));
            }

            const tmpDir = path.join(__dirname, "../tmp");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

            const rawPath = path.join(tmpDir, `${Date.now()}_raw.mp3`);
            const finalPath = path.join(tmpDir, `${Date.now()}.mp3`);

            const audioStream = await axios.get(downloadUrl, {
                responseType: "stream"
            });

            await streamPipeline(
                audioStream.data,
                fs.createWriteStream(rawPath)
            );

            await new Promise((resolve, reject) => {
                ffmpeg(rawPath)
                    .audioBitrate("128k")
                    .on("end", resolve)
                    .on("error", reject)
                    .save(finalPath);
            });

            await sock.sendMessage(jid, {
                audio: fs.readFileSync(finalPath),
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`
            }, { quoted: msg });

            fs.unlinkSync(rawPath);
            fs.unlinkSync(finalPath);

            await sock.sendMessage(jid, {
                react: { text: "✅", key: msg.key }
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(jid, {
                text: "❌ Error al descargar la canción."
            }, { quoted: msg });

            await sock.sendMessage(jid, {
                react: { text: "❌", key: msg.key }
            });
        }
    }
};
