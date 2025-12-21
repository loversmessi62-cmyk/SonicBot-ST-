import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import axios from "axios";

export default {
  commands: ["qc"],
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    // ── TEXTO ─────────────────────────
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
    const lines = wrapText(text, 26, 6);

    // ── AVATAR ────────────────────────
    let avatarUrl;
    try {
      avatarUrl = await sock.profilePictureUrl(ctx.sender, "image");
    } catch {
      avatarUrl = "https://files.catbox.moe/mgqqcn.jpeg"; // default
    }

    const avatarBuffer = Buffer.from(
      (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data
    );

    const tmp = Date.now();
    const avatarPath = path.join(process.cwd(), `qc_avatar_${tmp}.png`);
    fs.writeFileSync(avatarPath, avatarBuffer);

    // ── SVG (TRANSPARENTE + BURBUJA) ──
    const tspans = lines
      .map(
        (line, i) =>
          `<tspan x="130" dy="${i === 0 ? 0 : 40}">${escapeXML(
            line
          )}</tspan>`
      )
      .join("");

    const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="76" cy="96" r="36"/>
    </clipPath>
  </defs>

  <!-- BURBUJA -->
  <rect x="24" y="32" width="464" height="448"
        rx="36" ry="36"
        fill="#1f1f1f"/>

  <!-- AVATAR -->
  <image href="file://${avatarPath}"
         x="40" y="60"
         width="72" height="72"
         clip-path="url(#avatarClip)"/>

  <!-- NOMBRE -->
  <text x="130" y="90"
        font-size="28"
        fill="#25D366"
        font-family="Arial"
        font-weight="bold">
    ${escapeXML(name)}
  </text>

  <!-- TEXTO -->
  <text x="130" y="140"
        font-size="30"
        fill="#ffffff"
        font-family="Arial">
    ${tspans}
  </text>
</svg>`;

    const svgPath = path.join(process.cwd(), `qc_${tmp}.svg`);
    const pngPath = path.join(process.cwd(), `qc_${tmp}.png`);
    const webpPath = path.join(process.cwd(), `qc_${tmp}.webp`);

    fs.writeFileSync(svgPath, svg);

    // SVG → PNG
    await run("ffmpeg", ["-y", "-i", svgPath, pngPath]);

    // PNG → WEBP (STICKER)
    await run("ffmpeg", [
      "-y",
      "-i", pngPath,
      "-vf",
      "scale=512:512:force_original_aspect_ratio=decrease",
      "-vcodec", "libwebp",
      "-lossless", "0",
      "-q:v", "85",
      "-pix_fmt", "yuv420p",
      webpPath
    ]);

    await sock.sendMessage(
      jid,
      { sticker: fs.readFileSync(webpPath) },
      { quoted: msg }
    );

    [svgPath, pngPath, webpPath, avatarPath].forEach(f => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  }
};

// ── UTILIDADES ───────────────────────

function wrapText(text, maxChars, maxLines) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const w of words) {
    if ((line + w).length > maxChars) {
      lines.push(line.trim());
      line = w + " ";
      if (lines.length >= maxLines) break;
    } else {
      line += w + " ";
    }
  }
  if (line.trim() && lines.length < maxLines) {
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
