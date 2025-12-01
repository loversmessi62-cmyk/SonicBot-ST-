export default {
    commands: ["booty"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        const links = [
            "https://files.catbox.moe/vef24v.jpeg",
            "https://files.catbox.moe/naom00.jpeg",
        ];

        if (links.length === 0)
            return sock.sendMessage(jid, { text: "⚠ No hay links en el comando .booty" });

        // prevenir caché
        const random = links[Math.floor(Math.random() * links.length)] + "?r=" + Math.random();

        const isVideo = random.includes(".mp4") || random.includes(".mov");

        await sock.sendMessage(jid, {
            [isVideo ? "video" : "image"]: { url: random },
            caption: "🍑 *booty*"
        });
    }
};
