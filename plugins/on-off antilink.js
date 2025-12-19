import { setAntilink, isAntilinkEnabled } from "../utils/antilinkState.js";

export default {
    commands: ["antilink"],
    admin: true,
    category: "on-off",

    async run(sock, msg, args, ctx) {
        if (!ctx.isGroup)
            return sock.sendMessage(ctx.jid, { text: "❌ Solo en grupos." });

        const option = args[0];

        if (!option || !["on", "off"].includes(option)) {
            return sock.sendMessage(ctx.jid, {
                text: "Uso: .antilink on | off"
            });
        }

        setAntilink(ctx.jid, option === "on");

        sock.sendMessage(ctx.jid, {
            text: `🔗 Antilink ${option === "on" ? "ACTIVADO" : "DESACTIVADO"}`
        });
    }
};
