import yts from "yt-search";
import axios from "axios";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";

const streamPipeline = promisify(pipeline);
const formatAudio = ['mp3', 'm4a', 'webm', 'aac', 'flac', 'opus', 'ogg', 'wav'];

const handler = async (sock, msg, args, ctx) => {
  const { jid } = ctx;

  if (!args || !args.length) {
    return await sock.sendMessage(jid, {
      text: `✳️ Usa: .play <nombre o link de la canción>`
    }, { quoted: msg });
  }

  const query = args.join(" ");

  await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

  try {
    // 🔎 Buscar en YouTube
    const search = await yts(query);
    if (!search.videos || search.videos.length === 0)
      throw new Error("No se encontraron resultados.");

    const video = search.videos[0];
    const { title, url, timestamp, views, author, thumbnail } = video;

    // Info mensaje
    const infoMessage = `
╔══════════════╗
║   ✦ ADRIBOT MUSIC ✦
╚══════════════╝
📀 *Info del video:*  
├ 🎼 Título: ${title}
├ ⏱️ Duración: ${timestamp}
├ 👁️ Vistas: ${views.toLocaleString()}
├ 👤 Autor: ${author.name}
└ 🔗 Enlace: ${url}

⏳ *Procesando tu música...*`;

    await sock.sendMessage(jid, {
      image: { url: thumbnail },
      caption: infoMessage
    }, { quoted: msg });

    // ===========================
    // Descargar usando API Oceansaver
    // ===========================
    const ddownr = {
      download: async (url, format) => {
        if (!formatAudio.includes(format)) throw new Error("Formato no soportado");

        const config = {
          method: "GET",
          url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
          headers: { "User-Agent": "Mozilla/5.0" }
        };

        const response = await axios.request(config);
        if (response.data?.success) {
          const { id } = response.data;
          const downloadUrl = await ddownr.cekProgress(id);
          return downloadUrl;
        } else throw new Error("No se pudo obtener la información del audio");
      },
      cekProgress: async (id) => {
        const config = {
          method: "GET",
          url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
          headers: { "User-Agent": "Mozilla/5.0" }
        };

        while (true) {
          const res = await axios.request(config);
          if (res.data?.success && res.data.progress === 1000) return res.data.download_url;
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    };

    const downloadUrl = await ddownr.download(url, "mp3");

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.mp3`);
    const finalPath = path.join(tmpDir, `${Date.now()}_compressed.mp3`);

    // Descargar audio en crudo
    const audioRes = await axios.get(downloadUrl, { responseType: "stream" });
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

    // Comprimir audio con ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioBitrate("128k")
        .format("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(finalPath);
    });

    // Enviar audio
    await sock.sendMessage(jid, {
      audio: fs.readFileSync(finalPath),
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted: msg });

    // React final
    await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

  } catch (err) {
    console.error(err);
    await sock.sendMessage(jid, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
  }
};

handler.command = ["play"];
handler.tags = ["downloader"];
handler.help = ["play <nombre o link>"];

export default handler;
