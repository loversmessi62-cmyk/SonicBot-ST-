import {
    isByeEnabled,
    setBye,
    setByeText,
    getByeText
} from "../utils/welcomeState.js";

export default {
    commands: ["bye"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Solo en grupos." });

        const sub = args[0];

        if (sub === "on") {
            setBye(jid, true);
            return sock.sendMessage(jid, { text: "✅ Bye activado." });
        }

        if (sub === "off") {
            setBye(jid, false);
            return sock.sendMessage(jid, { text: "❌ Bye desactivado." });
        }

        if (sub === "set") {
            const text = args.slice(1).join(" ");
            if (!text)
                return sock.sendMessage(jid, { text: "❌ Usa: .bye set texto" });

            setByeText(jid, text);
            return sock.sendMessage(jid, { text: "✏️ Bye actualizado." });
        }

        return sock.sendMessage(jid, {
            text:
`📌 *BYE*
.bye on
.bye off
.bye set texto

Variables:
@user
@group`
        });
    },

    async onGroupUpdate(sock, update) {
        const { id, participants, action } = update;

        if (action !== "remove") return;
        if (!isByeEnabled(id)) return;

        const meta = await sock.groupMetadata(id);
        const text = getByeText(id);

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
