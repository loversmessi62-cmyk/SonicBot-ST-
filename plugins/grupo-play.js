import yts from "yt-search";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";
import axios from "axios";

const streamPipeline = promisify(pipeline);

const handler = async (sock, msg, args, ctx) => {
  const { jid, sender } = ctx;

  if (!args || !args.length) {
    return await sock.sendMessage(jid, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: .play La Factoria - Perdoname`
    }, { quoted: msg });
  }

  const query = args.join(" ");

  // ⏳ Reacción de procesamiento
  await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

  try {
    // 🔎 Buscar en YouTube
    const search = await yts(query);
    if (!search.videos || search.videos.length === 0) throw new Error("No se encontraron resultados.");

    const video = search.videos[0];
    const { title, url, timestamp, views, author, thumbnail } = video;

    // 📝 Enviar info del video
    const infoMessage = `
╔══════════════════╗
║   ✦ ADRIBOT MUSIC ✦
╚══════════════════╝

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

    // 🔗 Obtener audio usando ytdl-core
    const ytdl = (await import("ytdl-core")).default;
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.mp3`);
    const finalPath = path.join(tmpDir, `${Date.now()}_compressed.mp3`);

    const audioStream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
    await streamPipeline(audioStream, fs.createWriteStream(rawPath));

    // 🎛️ Comprimir con ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioBitrate("128k")
        .format("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(finalPath);
    });

    // 🎵 Enviar audio
    await sock.sendMessage(jid, {
      audio: fs.readFileSync(finalPath),
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted: msg });

    // ✅ Reacción de éxito
    await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

    // 🗑️ Limpiar archivos temporales
    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

  } catch (err) {
    console.error(err);
    await sock.sendMessage(jid, {
      text: `❌ Error: ${err.message}`
    }, { quoted: msg });

    await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
  }
};

handler.command = ["play"];
handler.tags = ["downloader"];
handler.help = ["play <búsqueda>"];

export default handler;

