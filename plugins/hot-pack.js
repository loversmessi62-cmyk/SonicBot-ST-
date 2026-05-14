export default {
    commands: ["pack"],
    category: "hot",

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid;

        const links = [
            "https://i.ibb.co/XkjVyd9W.jpg",
            "https://i.ibb.co/c71YVLX.jpg",
            "https://i.ibb.co/6R8YQRTM.jpg"
        ];

        if (links.length === 0)
            return sock.sendMessage(jid, {
                text: "⚠ No hay links en el comando .pack"
            }, { quoted: msg });

        const random = links[Math.floor(Math.random() * links.length)];
        const isVideo = random.endsWith(".mp4") || random.endsWith(".mov");

        await sock.sendMessage(jid, {
            [isVideo ? "video" : "image"]: { url: random },
            caption: "📦 *pack*"
        }, { quoted: msg });
    }
};