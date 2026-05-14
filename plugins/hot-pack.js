export default {
    commands: ["pack"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        const links = [
            "https://ibb.co/XkjVyd9W",
            "https://ibb.co/c71YVLX",
            "https://ibb.co/6R8YQRTM"
        ];

        if (!links.length)
            return sock.sendMessage(jid, { text: "⚠ No hay links en .pack" });

        const random = links[Math.floor(Math.random() * links.length)];
        const isVideo = random.endsWith(".mp4") || random.endsWith(".mov");

        await sock.sendMessage(jid, {
            [isVideo ? "video" : "image"]: { url: random },
            caption: "📦 *PACK*"
        });
    }
};