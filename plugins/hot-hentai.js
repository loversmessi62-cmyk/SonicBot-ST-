export default {
    commands: ["hentai"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        await sock.sendMessage(ctx.jid, {
            image: { url: "https://api.waifu.pics/nsfw/waifu" },
            caption: "🔥 Hentai"
        });
    }
};
