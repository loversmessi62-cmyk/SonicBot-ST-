import { getState, setState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink"],
    admin: true,
    category: "on/off",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const option = (args[0] || "").toLowerCase();

        // ===============================
        // ON / OFF
        // ===============================

        if (!option)
            return sock.sendMessage(jid, { text: "⚠️ Usa:\n\n.antilink on\n.antilink off" });

        if (option === "on") {
            setState("antilink", true);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink ACTIVADO* 🟢" });
        }

        if (option === "off") {
            setState("antilink", false);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink DESACTIVADO* 🔴" });
        }

        return sock.sendMessage(jid, { text: "❌ Opción inválida. Usa: on / off" });
    },

    // =======================================================
    // 🔥 DETECCIÓN AUTOMÁTICA DE LINKS Y SANCIÓN
    // =======================================================
    async onMessage(sock, msg, ctx) {
        const jid = msg.key.remoteJid;

        // Solo grupos
        if (!ctx.isGroup) return;

        // Antilink apagado = no hace nada
        if (!getState("antilink")) return;

        // Ignorar admins
        const sender = msg.key.participant || msg.participant;
        const isAdmin = ctx.groupAdmins?.includes(sender);
        if (isAdmin) return;

        const body =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

        // Buscar links
        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        const found = body.match(linkRegex);

        if (!found) return;

        // ======================================
        // ACCIONES: BORRAR, ADVERTIR, EXPULSAR
        // ======================================

        // Borrar mensaje
        await sock.sendMessage(jid, {
            delete: msg.key
        });

        // Aviso
        await sock.sendMessage(
            jid,
            {
                text: `🚫 *Se detectó un enlace prohibido*\n@${sender.split("@")[0]} será expulsado.`,
                mentions: [sender]
            }
        );

        // Expulsar
        await sock.groupParticipantsUpdate(jid, [sender], "remove");
    }
};
