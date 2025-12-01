export default {
    commands: ["rule34", "r34"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const tag = args.join(" ") || "random";

        await sock.sendMessage(ctx.jid, {
            image: { url: `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}` },
            caption: `🔥 Rule34 – ${tag}`
        });
    }
};
