import {
    isWelcomeEnabled,
    setWelcome,
    setWelcomeText,
    getWelcomeText
} from "../utils/welcomeState.js";

export default {
    commands: ["welcome"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Solo en grupos." });

        const sub = args[0];

        if (sub === "on") {
            setWelcome(jid, true);
            return sock.sendMessage(jid, { text: "✅ Welcome activado." });
        }

        if (sub === "off") {
            setWelcome(jid, false);
            return sock.sendMessage(jid, { text: "❌ Welcome desactivado." });
        }

        if (sub === "set") {
            const text = args.slice(1).join(" ");
            if (!text)
                return sock.sendMessage(jid, { text: "❌ Usa: .welcome set texto" });

            setWelcomeText(jid, text);
            return sock.sendMessage(jid, { text: "✏️ Welcome actualizado." });
        }

        return sock.sendMessage(jid, {
            text:
`📌 *WELCOME*
.welcome on
.welcome off
.welcome set texto

Variables:
@user
@group`
        });
    },

    async onGroupUpdate(sock, update) {
        const { id, participants, action } = update;

        if (action !== "add") return;
        if (!isWelcomeEnabled(id)) return;

        const meta = await sock.groupMetadata(id);
        const text = getWelcomeText(id);

        for (let user of participants) {
            const final = text
                .replace(/@user/g, `@${user.split("@")[0]}`)
                .replace(/@group/g, meta.subject);

            await sock.sendMessage(id, {
                text: final,
                mentions: [user]
            });
        }
    }
};
