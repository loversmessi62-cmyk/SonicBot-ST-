import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import axios from "axios";

export default {
  commands: ["qc"],
  category: "grupo",

  async run(sock, msg, args, ctx) {
    const jid = msg.key.remoteJid;

    // ── TEXTO ─────────────────────
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
    const lines = wrapText(text, 24, 6);

    // ── AVATAR (OPCIONAL) ──────────
    let avatarPath = null;
    try {
      const url = await sock.profilePictureUrl(ctx.sender, "image");
      const buf = Buffer.from(
        (await axios.get(url, { responseType: "arraybuffer" })).data
      );
      avatarPath = path.join(process.cwd(), `qc_avatar_${Date.now()}.png`);
      fs.writeFileSync(avatarPath, buf);
    } catch {
      avatarPath = null; // 👈 si no hay foto, no se usa
    }

    // ── TEXTO SVG ─────────────────
    const tspans = lines
      .map(
        (l, i) =>
          `<tspan x="${avatarPath ? 110 : 64}" dy="${
            i === 0 ? 0 : 38
          }">${escapeXML(l)}</tspan>`
      )
      .join("");

    // ── SVG BURBUJA ───────────────
    const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">

  <defs>
    <clipPath id="ava">
      <circle cx="56" cy="56" r="28"/>
    </clipPath>
  </defs>

  <!-- BURBUJA (path tipo WhatsApp) -->
  <path d="
    M32 40
    Q32 16 56 16
    H456
    Q480 16 480 40
    V360
    Q480 384 456 384
    H120
    L80 416
    V384
    H56
    Q32 384 32 360
    Z"
    fill="#1f1f1f"/>

  ${
    avatarPath
      ? `<image href="file://${avatarPath}"
          x="28" y="28" width="56" height="56"
          clip-path="url(#ava)"/>`
      : ""
  }

  <!-- NOMBRE -->
  <text x="${avatarPath ? 110 : 64}" y="64"
        font-size="26"
        fill="#25D366"
        font-family="Arial"
        font-weight="bold">
    ${escapeXML(name)}
  </text>

  <!-- TEXTO -->
  <text x="${avatarPath ? 110 : 64}" y="110"
        font-size="30"
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
      "scale=512:512:force_original_aspect_ratio=decrease",
      "-vcodec", "libwebp",
      "-lossless", "0",
      "-q:v", "90",
      webpPath
    ]);

    await sock.sendMessage(
      jid,
      { sticker: fs.readFileSync(webpPath) },
      { quoted: msg }
    );

    [svgPath, pngPath, webpPath, avatarPath].forEach(f => {
      if (f && fs.existsSync(f)) fs.unlinkSync(f);
    });
  }
};

// ── UTILS ───────────────────────

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
  if (line.trim() && lines.length < maxLines) lines.push(line.trim());
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
