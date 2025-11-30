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
        const key = `antilink_${jid}`; // clave por grupo

        if (!option)
            return sock.sendMessage(jid, { text: "⚠️ Usa:\n\n.antilink on\n.antilink off" });

        if (option === "on") {
            setState(key, true);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink ACTIVADO* 🟢" });
        }

        if (option === "off") {
            setState(key, false);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink DESACTIVADO* 🔴" });
        }

        return sock.sendMessage(jid, { text: "❌ Opción inválida. Usa: on / off" });
    },

    async onMessage(sock, msg, ctx) {
        const jid = msg.key.remoteJid;
        if (!ctx.isGroup) return;

        const key = `antilink_${jid}`; 
        const active = getState(key); 
        if (!active) return; // funciona correctamente con booleano exacto del grupo

        const sender = msg.key.participant || msg.participant;
        const isAdmin = ctx.groupAdmins?.includes(sender);
        if (isAdmin) return;

        const body =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        const found = body.match(linkRegex);

        if (!found) return;

        // BORRAR MENSAJE
        try {
            await sock.sendMessage(jid, { delete: msg.key });
        } catch {}

        // ADVERTENCIA
        await sock.sendMessage(jid, {
            text: `🚫 *Se detectó un enlace prohibido*\n@${sender.split("@")[0]} será eliminado.`,
            mentions: [sender]
        });

        // EXPULSAR
        try {
            await sock.groupParticipantsUpdate(jid, [sender], "remove");
        } catch {}
    }
};