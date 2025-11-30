// ======================================================
// 🔥 PLUGIN ANTI-LINK (ON/OFF + AUTOKICK + DETECTOR)
// Adaptado completamente a tu handler
// ======================================================

const linkRegex = /(https?:\/\/[^\s]+)/gi;

export default {
    commands: ["antilink"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const { isGroup, isAdmin } = ctx;
        const jid = msg.key.remoteJid;

        if (!isGroup)
            return sock.sendMessage(jid, { text: "⚠️ Este comando solo funciona en grupos." });

        if (!isAdmin)
            return sock.sendMessage(jid, { text: "❌ Solo administradores pueden usar este comando." });

        // ===========================
        // SISTEMA POR GRUPO
        // ===========================
        global.ANTILINK = global.ANTILINK || {};
        if (!global.ANTILINK[jid]) global.ANTILINK[jid] = { active: false };

        if (!args[0]) {
            return sock.sendMessage(jid, {
                text: `🛡️ *Estado actual del AntiLink*: ${global.ANTILINK[jid].active ? "🟢 ACTIVADO" : "🔴 DESACTIVADO"}\n\n` +
                      `Usa:\n• .antilink on\n• .antilink off`
            });
        }

        const opt = args[0].toLowerCase();

        if (opt === "on") {
            global.ANTILINK[jid].active = true;
            return sock.sendMessage(jid, { text: "🟢 *Anti-Link ACTIVADO en este grupo.*" });
        }

        if (opt === "off") {
            global.ANTILINK[jid].active = false;
            return sock.sendMessage(jid, { text: "🔴 *Anti-Link DESACTIVADO en este grupo.*" });
        }

        return sock.sendMessage(jid, {
            text: `Usa:\n• .antilink on\n• .antilink off`
        });
    },

    // ======================================================
    //      🔥 DETECCIÓN AUTOMÁTICA DE LINKS
    // ======================================================

    async onMessage(sock, msg, ctx) {
        const { isGroup, isAdmin, groupMetadata } = ctx;
        if (!isGroup) return;

        const jid = msg.key.remoteJid;
        global.ANTILINK = global.ANTILINK || {};

        // AntiLink desactivado → salir
        if (!global.ANTILINK[jid]?.active) return;

        // Obtener texto (igual que tu handler)
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        if (!text) return;

        // No contiene link → salir
        if (!linkRegex.test(text)) return;

        const sender = msg.key.participant;

        // No expulsar a admins
        if (isAdmin) return;

        // Obtener ID del bot
        const botId = sock.user.id.split(":")[0];

        // No expulsarse a si mismo
        if (sender.startsWith(botId)) return;

        // El bot es administrador?
        const botData = groupMetadata.participants.find(p => p.id.includes(botId));
        const botIsAdmin = botData?.admin !== null;

        if (!botIsAdmin) {
            return sock.sendMessage(jid, { text: "⚠️ AntiLink activo, pero no soy admin para expulsar." });
        }

        // Aviso
        await sock.sendMessage(jid, {
            text: `🚫 *Prohibido enviar links.*\n@${sender.split("@")[0]} será expulsado.`,
            mentions: [sender]
        });

        // Expulsión
        await sock.groupParticipantsUpdate(jid, [sender], "remove");
    }
};
