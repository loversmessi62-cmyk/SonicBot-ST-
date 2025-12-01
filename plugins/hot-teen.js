export default {
    commands: ["teen", "milf"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const cmd = ctx.command;

        const url = cmd === "teen"
            ? "https://nekobot.xyz/api/image?type=pgif"
            : "https://nekobot.xyz/api/image?type=boobs";

        await sock.sendMessage(ctx.jid, {
            image: { url },
            caption: `🔥 ${cmd.toUpperCase()}`
        });
    }
};
