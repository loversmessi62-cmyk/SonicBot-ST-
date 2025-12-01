import fs from "fs";
import path from "path";

export default {
    commands: ["ass", "boobs", "pussy", "pack", "pornvid"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;
        const cmd = ctx.command; // "ass", "boobs", etc.

        const dir = `./media18/${cmd}`;

        if (!fs.existsSync(dir))
            return sock.sendMessage(jid, { text: `⚠ No encontré archivos para *${cmd}*.` });

        const files = fs.readdirSync(dir);
        if (files.length === 0)
            return sock.sendMessage(jid, { text: `⚠ La carpeta *${cmd}* está vacía.` });

        const random = files[Math.floor(Math.random() * files.length)];
        const filePath = path.join(dir, random);

        const isVideo = random.endsWith(".mp4") || random.endsWith(".mov");

        await sock.sendMessage(jid, {
            [isVideo ? "video" : "image"]: { url: filePath },
            caption: `🔥 *${cmd.toUpperCase()}*`
        });
    }
};
