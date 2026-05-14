export default {
    commands: ["pack"],
    category: "hot",

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid || msg.chat || msg.key?.remoteJid

        const links = [
            "https://files.catbox.moe/6f7ufo.jpeg",
            "https://files.catbox.moe/vvnn3r.jpeg",
            "https://files.catbox.moe/1t6rds.jpeg"
        ]

        if (!links.length) {
            return sock.sendMessage(jid, {
                text: "⚠ No hay links en el comando .pack"
            }, { quoted: msg })
        }

        const random = links[Math.floor(Math.random() * links.length)]

        const isVideo = random.endsWith(".mp4") || random.endsWith(".mov")

        await sock.sendMessage(jid, {
            [isVideo ? "video" : "image"]: { url: random },
            caption: "📦 *PACK*"
        }, { quoted: msg })
    }
}