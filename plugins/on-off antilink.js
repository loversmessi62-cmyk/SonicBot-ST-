import { getState, setState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink", "antilinks"],
    admin: true,
    group: true,
    category: "on/off",

    async run(sock, msg, args, ctx) {

        const jid = msg.key.remoteJid;

        if (!ctx || !ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const opt = args[0];

        if (opt === "on") {
            setState(jid, "antilink", true);
            return sock.sendMessage(jid, { text: "🟢 *Antilink activado correctamente.*" });
        }

        if (opt === "off") {
            setState(jid, "antilink", false);
            return sock.sendMessage(jid, { text: "🔴 *Antilink desactivado.*" });
        }

        return sock.sendMessage(jid, { 
            text: `⚙️ *ANTILINK*\nEstado: ${getState(jid, "antilink") ? "🟢 ON" : "🔴 OFF"}\n\nUsa:\n.antilink on\n.antilink off`
        });
    },

    async onMessage(sock, msg, ctx) {
        // PREVENIR CRASH
        if (!ctx || !ctx.isGroup) return;

        const jid = msg.key.remoteJid;

        if (!getState(jid, "antilink")) return;

        const body = msg.body || "";

        if (/(https?:\/\/)?chat\.whatsapp\.com\//i.test(body)) {

            // Obtener info del remitente
            const user = msg.sender;

            // Si es admin, ignorar
            if (ctx.isAdmin(user)) return;

            await sock.sendMessage(jid, { 
                text: `🚫 *Enlace detectado*\n@${user.split("@")[0]} no se permiten links aquí.`,
                mentions: [user]
            });

            try {
                await sock.groupParticipantsUpdate(
                    jid,
                    [user],
                    "remove"
                );
            } catch (err) {
                console.log("Error al expulsar:", err);
            }
        }
    }
};
