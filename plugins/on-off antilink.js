import { getState, setState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink", "antilinks"],
    admin: true,
    group: true,
    category: "on/off",

    async run(sock, msg, args, ctx) {

        const { jid } = ctx;

        const opt = (args[0] || "").toLowerCase();

        if (opt === "on") {
            setState("antilink", true, jid); // 🔥 GUARDAR POR GRUPO
            return sock.sendMessage(jid, { text: "🟢 *Antilink activado en este grupo.*" });
        }

        if (opt === "off") {
            setState("antilink", false, jid); // 🔥 DESACTIVAR SOLO ESTE GRUPO
            return sock.sendMessage(jid, { text: "🔴 *Antilink desactivado en este grupo.*" });
        }

        const estado = getState("antilink", jid);

        return sock.sendMessage(jid, { 
            text: `⚙️ *ANTILINK*\n\nEstado en este grupo: ${estado ? "🟢 ON" : "🔴 OFF"}\n\nUsa:\n.antilink on\n.antilink off`
        });
    },

    async onMessage(sock, msg, ctx) {

        const { jid, isGroup, isAdmin, sender } = ctx;
        if (!isGroup) return;

        // Si en este grupo NO está activado → ignorar
        if (!getState("antilink", jid)) return;

        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        // Detectar links de grupos
        if (!/(https?:\/\/)?chat\.whatsapp\.com\//i.test(text)) return;

        if (isAdmin)
            return; // Admin no se expulsa

        await sock.sendMessage(jid, {
            text: `🚫 *Link detectado*\n@${sender.split("@")[0]} no se permiten links.`,
            mentions: [sender]
        });

        try {
            await sock.groupParticipantsUpdate(jid, [sender], "remove");
        } catch (e) {
            console.log("Error expulsando:", e);
        }
    }
};
