export default {
    commands: ["pack"],
    category: "hot",

    async run(sock, msg, args, ctx) {

        // 🔥 FIX IMPORTANTE: obtener chat correcto
        const jid = msg.chat || msg.key?.remoteJid || ctx.jid

        if (!jid) return

        const links = [
            "https://i.ibb.co/XkjVyd9W.jpg",
            "https://i.ibb.co/c71YVLX.jpg",
            "https://i.ibb.co/6R8YQRTM.jpg"
        ]

        const random = links[Math.floor(Math.random() * links.length)]

        try {
            await sock.sendMessage(
                jid,
                {
                    image: { url: random },
                    caption: "📦 *PACK*"
                },
                { quoted: msg }
            )
        } catch (e) {
            console.log("Error pack:", e)
        }
    }
}