import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export default {
  commands: ["qc"],
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    // 🔹 Texto citado
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

    // 🔹 Nombre del usuario
    const name =
      msg.pushName || ctx.sender.split("@")[0];

    // 🔹 SVG QC REAL
    const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="32" ry="32" fill="#0f0f0f"/>
  
  <rect x="32" y="64" width="448" height="384" rx="28" ry="28" fill="#1f1f1f"/>

  <text x="64" y="110"
        font-size="28"
        fill="#25D366"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="bold">
    ${escapeXML(name)}
  </text>

  <foreignObject x="64" y="140" width="384" height="280">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="
           color:white;
           font-size:30px;
           font-family:Arial, Helvetica, sans-serif;
           line-height:1.3;
           word-wrap:break-word;">
      ${escapeXML(text)}
    </div>
  </foreignObject>
</svg>`;

    const tmp = Date.now();
    const svgPath = path.join(process.cwd(), `qc_${tmp}.svg`);
    const pngPath = path.join(process.cwd(), `qc_${tmp}.png`);
    const webpPath = path.join(process.cwd(), `qc_${tmp}.webp`);

    fs.writeFileSync(svgPath, svg);

    // SVG → PNG
    await run("ffmpeg", [
      "-y",
      "-i", svgPath,
      pngPath
    ]);

    // PNG → WEBP (sticker)
    await run("ffmpeg", [
      "-y",
      "-i", pngPath,
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
      "-vcodec", "libwebp",
      "-lossless", "0",
      "-q:v", "80",
      "-preset", "default",
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

// 🔹 Evitar romper SVG
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
    p.on("close", code =>
      code === 0 ? resolve() : reject()
    );
  });
}
