import { getState, toggleState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink"],
    admin: true,
    category: "on/off",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        // Estado actual
        const status = getState("antilink");

        // Cambiar estado
        toggleState("antilink");

        const newStatus = getState("antilink");

        await sock.sendMessage(jid, {
            text: `🛡️ *Antilink ahora está:* ${newStatus ? "🟢 ACTIVADO" : "🔴 DESACTIVADO"}`
        });
    }
};
