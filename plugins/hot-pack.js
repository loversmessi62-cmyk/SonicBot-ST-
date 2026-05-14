export default {
    commands: ["pack"],
    category: "hot",

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid || msg.chat || msg.key?.remoteJid

        const links = [
            "https://i.ibb.co/JFb1z7kp.jpg",
            "https://i.ibb.co/7JYQ1WsS.jpg",
            "https://i.ibb.co/prfDkwwR.jpg"
        ]

        const random = links[Math.floor(Math.random() * links.length)]

        await sock.sendMessage(jid, {
            image: { url: random },
            caption: "📦 *PACK*"
        }, { quoted: msg })
    }
}