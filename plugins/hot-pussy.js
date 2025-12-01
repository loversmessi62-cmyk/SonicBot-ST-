export default {
    commands: ["pussy"],
    category: "+18",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        const links = [
            "https://yourlink1.jpg",
            "https://yourlink2.png",
            "https://yourlink3.mp4"
        ];

        if (!links.length)
            return sock.sendMessage(jid, { text: "⚠ No hay links en .pussy" });

        const random = links[Math.floor(Math.random() * links.length)];
        const isVideo = random.endsWith(".mp4") || random.endsWith(".mov");

        await sock.sendMessage(jid, {
            [isVideo ? "video" : "image"]: { url: random },
            caption: "💦 *PUSSY*"
        });
    }
};
