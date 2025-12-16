import { setWelcome } from "../utils/welcomeState.js";

export default {
    commands: ["welcome"],
    admin: true,
    group: true,

    async run(sock, msg, args) {
        const jid = msg.key.remoteJid;

        if (!args[0]) {
            return sock.sendMessage(jid, {
                text: "Uso: .welcome on | off"
            });
        }

        const state = args[0].toLowerCase();

        if (state === "on") {
            setWelcome(jid, true);
            await sock.sendMessage(jid, { text: "✅ Welcome ACTIVADO en este grupo" });
        } else if (state === "off") {
            setWelcome(jid, false);
            await sock.sendMessage(jid, { text: "❌ Welcome DESACTIVADO en este grupo" });
        }
    }
};
