import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export default {
  commands: ["qc"],
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    // 📌 Obtener texto
    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    let text =
      quoted?.conversation ||
      quoted?.extendedTextMessage?.text ||
      (args.length ? args.join(" ") : null);

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "❌ Responde a un texto o usa: *.qc hola*" },
        { quoted: msg }
      );
    }

    const name = msg.pushName || ctx.sender.split("@")[0];

    // 🔹 Cortar texto en líneas (manual, FFmpeg-safe)
    const lines = wrapText(text, 28, 6);

    const tspans = lines
      .map((line, i) =>
        `<tspan x="64" dy="${i === 0 ? 0 : 42}">${escapeXML(line)}</tspan>`
      )
      .join("");

    const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="40" ry="40" fill="#0e0e0e"/>
  <rect x="32" y="64" width="448" height="384" rx="30" ry="30" fill="#1f1f1f"/>

  <text x="64" y="120"
        font-size="30"
        fill="#25D366"
        font-family="Arial"
        font-weight="bold">
    ${escapeXML(name)}
  </text>

  <text x="64" y="170"
        font-size="32"
        fill="#ffffff"
        font-family="Arial">
    ${tspans}
  </text>
</svg>`;

    const tmp = Date.now();
    const svgPath = path.join(process.cwd(), `qc_${tmp}.svg`);
    const pngPath = path.join(process.cwd(), `qc_${tmp}.png`);
    const webpPath = path.join(process.cwd(), `qc_${tmp}.webp`);

    fs.writeFileSync(svgPath, svg);

    await run("ffmpeg", ["-y", "-i", svgPath, pngPath]);

    await run("ffmpeg", [
      "-y",
      "-i", pngPath,
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
      "-vcodec", "libwebp",
      "-lossless", "0",
      "-q:v", "80",
      webpPath
    ]);

    await sock.sendMessage(
      jid,
      { sticker: fs.readFileSync(webpPath) },
      { quoted: msg }
    );

    fs.unlinkSync(svgPath);
    fs.unlinkSync(pngPath);
    fs.unlinkSync(webpPath);
  }
};

// =======================
// UTILIDADES
// =======================

function wrapText(text, maxChars, maxLines) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    if ((line + word).length > maxChars) {
      lines.push(line.trim());
      line = word + " ";
      if (lines.length >= maxLines) break;
    } else {
      line += word + " ";
    }
  }

  if (lines.length < maxLines && line.trim()) {
    lines.push(line.trim());
  }

  return lines;
}

function escapeXML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    p.on("close", code => (code === 0 ? resolve() : reject()));
  });
}
