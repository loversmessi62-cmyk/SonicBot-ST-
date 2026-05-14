export default {
    commands: ["pack"],
    category: "hot",

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid;

        // 🔥 LINKS DIRECTOS (ejemplo corregido)
        const links = [
            "https://i.ibb.co/XkjVyd9W.jpg",
            "https://i.ibb.co/c71YVLX.jpg",
            "https://i.ibb.co/6R8YQRTM.jpg"
        ];

        const random = links[Math.floor(Math.random() * links.length)];

        await sock.sendMessage(jid, {
            image: { url: random },
            caption: "📦 *PACK*"
        }, { quoted: msg });
    }
};