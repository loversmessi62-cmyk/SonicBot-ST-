import config from "./config.js";

/* ============================================================
   FIX PARA JID DE BAILEYS GATANINA-LI (convierte @lid → @s.whatsapp.net)
   ============================================================ */
function fixLidJid(jid) {
    if (!jid) return jid;
    if (!jid.endsWith("@lid")) return jid;

    let num = jid.replace("@lid", "");
    num = num.slice(0, -1); // quitar último dígito extra

    return num + "@s.whatsapp.net";
}

/* ============================================================
   NORMALIZAR CUALQUIER JID QUE ENTRE AL BOT
   ============================================================ */
function normalizeJid(jid) {
    if (!jid) return null;
    jid = jid.split(":")[0]; // eliminar device suffix
    return fixLidJid(jid);
}

/* ============================================================
   OBTENER TEXTO REAL DEL MENSAJE
   ============================================================ */
function getMessageText(msg) {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        msg.message?.documentMessage?.caption ||
        msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
        msg.message?.ephemeralMessage?.message?.conversation ||
        msg.message?.viewOnceMessage?.message?.extendedTextMessage?.text ||
        ""
    );
}

/* ============================================================
   HANDLER PRINCIPAL
   ============================================================ */
export async function handler(sock, msg) {
    try {
        const jid = msg.key.remoteJid;
        if (!msg.message) return;

        const isGroup = jid.endsWith("@g.us");

        // ================================================
        // SENDER REAL (normalizado)
        // ================================================
        const rawSender =
            msg.key.participant ||
            msg.participant ||
            msg.key.remoteJid;

        const sender = normalizeJid(rawSender);

        console.log("\n👤 SENDER RAW:", rawSender);
        console.log("👤 SENDER NORMALIZADO:", sender);

        // ================================================
        // BOT JID REAL
        // ================================================
        const botJid = normalizeJid(sock.user.id);

        console.log("🤖 BOT ID:", botJid);

        // ================================================
        // TEXTO DEL MENSAJE
        // ================================================
        const body = getMessageText(msg);
        if (!body.startsWith(config.prefix)) return;

        const args = body.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift()?.toLowerCase();

        // ================================================
        // METADATA Y PERMISOS
        // ================================================
        let metadata = {};
        let admins = [];
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            admins = metadata.participants
                .filter(p => p.admin !== null) // admin o superadmin
                .map(p => normalizeJid(p.id));

            console.log("👑 ADMINS NORMALIZADOS:", admins);

            isAdmin = admins.includes(sender);
            isBotAdmin = admins.includes(botJid);

            console.log("🟦 isAdmin:", isAdmin);
            console.log("🟨 isBotAdmin:", isBotAdmin);
        }

        // ================================================
        // EJECUTAR PLUGIN
        // ================================================
        for (let plugin of global.plugins) {
            if (!plugin.commands.includes(command)) continue;

            return plugin.run(sock, msg, args, {
                isGroup,
                isAdmin,
                isBotAdmin,
                groupMetadata: metadata,
                sender,
                botJid
            });
        }

    } catch (e) {
        console.error("❌ Handler error:", e);
    }
}
