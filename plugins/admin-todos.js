import { getState, setState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink"],
    admin: true,
    category: "on/off",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        const action = (args[0] || "").toLowerCase();

        if (action === "on") {
            setState("antilink", true);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink ACTIVADO.*" });
        }

        if (action === "off") {
            setState("antilink", false);
            return sock.sendMessage(jid, { text: "🔴 *Antilink DESACTIVADO.*" });
        }

        return sock.sendMessage(jid, { text: "⚠️ Usa:\n.antilink on\n.antilink off" });
    },

    // ESTE ES EL QUE DETECTA LINKS AUTOMÁTICAMENTE
    async onMessage(sock, msg) {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        if (!isGroup) return;

        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        // ¿Antilink apagado?
        if (!getState("antilink")) return;

        // Regex para detectar links
        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        if (!linkRegex.test(text)) return;

        // Obtener sender
        const sender = msg.key.participant || msg.key.remoteJid;

        // Obtener metadata del grupo
        let metadata;
        try {
            metadata = await sock.groupMetadata(jid);
        } catch (e) {
            return;
        }

        const adminList = metadata.participants
            .filter(p => p.admin)
            .map(p => p.id);

        const isAdmin = adminList.includes(sender);

        if (isAdmin) return; // No expulsar admins

        // 1️⃣ BORRAR MENSAJE
        try {
            await sock.sendMessage(jid, { delete: msg.key });
        } catch {}

        // 2️⃣ AVISO
        await sock.sendMessage(jid, {
            text: `🚫 *Se detectó un link prohibido*\nEliminando a @${sender.split("@")[0]}…`,
            mentions: [sender]
        });

        // 3️⃣ EXPULSAR
        try {
            await sock.groupParticipantsUpdate(jid, [sender], "remove");
        } catch {}
    }
};
