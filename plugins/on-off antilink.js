import { getState, setState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink"],
    admin: true,
    category: "on/off",

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const option = (args[0] || "").toLowerCase();

        if (!option)
            return sock.sendMessage(jid, { text: "⚠️ Usa:\n\n.antilink on\n.antilink off" });

        // ACTIVAR
        if (option === "on") {
            setState("antilink", true);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink ACTIVADO* 🟢" });
        }

        // DESACTIVAR
        if (option === "off") {
            setState("antilink", false);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink DESACTIVADO* 🔴" });
        }

        return sock.sendMessage(jid, { text: "❌ Opción inválida. Usa: on / off" });
    },

    // =============================================
    // 🔥 DETECCIÓN DE LINKS + ELIMINAR + ADVERTIR + KICK
    // =============================================
    async onMessage(sock, msg, ctx) {
        const jid = msg.key.remoteJid;

        if (!ctx.isGroup) return;

        const active = getState("antilink");
        if (!active) return;

        const sender = msg.key.participant || msg.participant;
        const isAdmin = ctx.groupAdmins?.includes(sender);

        // Los admins no se expulsan
        if (isAdmin) return;

        const body =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        const found = body.match(linkRegex);

        if (!found) return;

        // ====================================
        // BORRAR MENSAJE
        // ====================================
        try {
            await sock.sendMessage(jid, { delete: msg.key });
        } catch (e) {
            console.log("Error al borrar mensaje:", e);
        }

        // ====================================
        // ADVERTENCIA
        // ====================================
        await sock.sendMessage(jid, {
            text: `🚫 *Regla rota:* Se detectó un enlace prohibido.\n\n@${sender.split("@")[0]}, serás eliminado del grupo.`,
            mentions: [sender]
        });

        // ====================================
        // KICK
        // ====================================
        try {
            await sock.groupParticipantsUpdate(jid, [sender], "remove");
        } catch (e) {
            console.log("Error al expulsar:", e);
        }
    }
};