import { getState, setState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink", "antilinks"],
    admin: true,
    group: true,
    category: "protección",

    async run(sock, msg, args, ctx) {

        // ====== VALIDACIONES SEGURAS ======
        if (!ctx || !ctx.isGroup)
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Este comando solo funciona en grupos." });

        const jid = msg.key.remoteJid;
        const sender = ctx.sender;

        // ====== ESTADO DEL GRUPO ======
        const currentState = getState(jid, "antilink") || false;

        // ====== ACTIVAR / DESACTIVAR ======
        if (args[0] === "on") {
            setState(jid, "antilink", true);
            return sock.sendMessage(jid, { text: "🛡️ *Antilink activado correctamente.*" });
        }

        if (args[0] === "off") {
            setState(jid, "antilink", false);
            return sock.sendMessage(jid, { text: "🚫 *Antilink desactivado.*" });
        }

        // ====== SI NO USA ON/OFF ======
        return sock.sendMessage(jid, {
            text: `⚙️ *ANTILINK PRO*\n\nEstado actual: *${currentState ? "🟢 ACTIVADO" : "🔴 DESACTIVADO"}*\n\nUsa:\n• .antilink on\n• .antilink off`
        });
    },

    // =============== HANDLER DE MENSAJES ===============
    async onMessage(sock, msg, ctx) {
        const jid = msg.key.remoteJid;

        // ====== VALIDACIONES SEGURAS ======
        if (!ctx || !ctx.isGroup) return;

        const isActive = getState(jid, "antilink");
        if (!isActive) return;

        const sender = ctx.sender;
        if (!sender) return;

        // SI EL QUE ENVÍA ES ADMIN, NO PASA NADA
        const metadata = await sock.groupMetadata(jid);
        const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
        const isAdminSender = admins.includes(sender);

        // ====== DETECTAR LINKS ======
        const body = msg.message.conversation ||
                     msg.message.extendedTextMessage?.text ||
                     "";

        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        const containsLink = linkRegex.test(body);

        if (!containsLink) return;

        // ====== SI ES ADMIN ======
        if (isAdminSender) {
            return sock.sendMessage(jid, { text: `⚠️ El admin envió un link:\n${body}` });
        }

        // ====== BORRAR MENSAJE ======
        try {
            await sock.sendMessage(jid, {
                delete: msg.key
            });
        } catch {}

        // ====== ADVERTIR ======
        await sock.sendMessage(jid, {
            text: `🚫 *Prohibido enviar links.*\n@${sender.split("@")[0]}`,
            mentions: [sender]
        });

        // ====== SANCIÓN OPCIONAL ======
        // await sock.groupParticipantsUpdate(jid, [sender], "remove"); ← si quieres expulsar
    }
};
