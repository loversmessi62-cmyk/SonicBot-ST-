import { setBye } from "../utils/welcomeState.js";

export default {
    commands: ["bye"],
    admin: true,
    group: true,

    async run(sock, msg, args) {
        const jid = msg.key.remoteJid;

        if (!args[0]) {
            return sock.sendMessage(jid, {
                text: "Uso: .bye on | off"
            });
        }

        const state = args[0].toLowerCase();

        if (state === "on") {
            setBye(jid, true);
            await sock.sendMessage(jid, { text: "✅ Bye ACTIVADO en este grupo" });
        } else if (state === "off") {
            setBye(jid, false);
            await sock.sendMessage(jid, { text: "❌ Bye DESACTIVADO en este grupo" });
        }
    }
};
