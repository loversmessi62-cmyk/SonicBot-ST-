import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { isMuted } from "./utils/muteState.js";
import { isAntilinkEnabled } from "./utils/antilinkState.js";

const groupCache = {};

// ===========================
//        STORE GLOBAL
// ===========================
export const store = { chats: {} };

const saveStore = () => {
    fs.writeFileSync("./store.json", JSON.stringify(store, null, 2));
};

if (fs.existsSync("./store.json")) {
    Object.assign(store, JSON.parse(fs.readFileSync("./store.json")));
}

// ===========================
//       SISTEMA PLUGINS
// ===========================
export const plugins = {};

export const loadPlugins = async () => {
    try {
        const dir = "./plugins";
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
        for (let file of files) {
            try {
                const module = await import("file://" + path.resolve(`./plugins/${file}`));
                const cmds = module.default.commands || module.default.command;
                if (!cmds) continue;
                cmds.forEach(cmd => plugins[cmd] = module.default);
            } catch (err) {
                console.error(`Error cargando plugin ${file}:`, err);
            }
        }
    } catch (e) {
        console.error("Error cargando plugins:", e);
    }
};

// ===========================
//       HANDLE MESSAGE
// ===========================
export const handleMessage = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");
        const sender = msg.key.participant || msg.key.remoteJid;

        // =======================
        // FUNCIONES DE NORMALIZACION
        // =======================
        const getNumber = (jid) => jid?.split("@")[0].split(":")[0] || "";
        const normalizeJid = (jid) => getNumber(jid) + "@s.whatsapp.net";

        const realSender = normalizeJid(sender);
        const botId = normalizeJid(sock.user.id);

        // =======================
        // TEXTO NORMALIZADO
        // =======================
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            msg.message?.buttonsResponseMessage?.selectedButtonId ||
            msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            msg.message?.templateButtonReplyMessage?.selectedId ||
            "";

        let fixedText = text || `[${Object.keys(msg.message || {})[0] || "SIN TEXTO"}]`;
        fixedText = fixedText.trim();

        // =======================
// SISTEMA DE ADMINS
// =======================
if (isGroup) {
    metadata = await sock.groupMetadata(jid);

    const getNumber = jid => jid?.split("@")[0].split(":")[0] || "";
    const senderNumber = getNumber(sender);
    const botNumber = getNumber(sock.user.id);

    // Detectar admins de forma confiable
    admins = [];
    metadata.participants.forEach(p => {
        const num = getNumber(p.id);
        if (p.admin === "admin" || p.admin === "superadmin") admins.push(num);
        // Si tu número es el del creador del grupo, también agregarlo
        if (num === senderNumber && p.admin === null) {
            // opcional: marcarlo como admin si es tu usuario
            admins.push(num);
        }
    });

    isAdmin = admins.includes(senderNumber);
    isBotAdmin = admins.includes(botNumber);

    console.log("Admins detectados:", admins);
    console.log("Sender es admin?", isAdmin);
    console.log("Bot es admin?", isBotAdmin);
}



        // =======================
        // SISTEMA MUTE
        // =======================
        if (isGroup && isMuted(jid, realSender) && !isAdmin) {
            try {
                await sock.sendMessage(jid, {
                    delete: { remoteJid: jid, fromMe: false, id: msg.key.id, participant: realSender }
                });
            } catch {}
            return;
        }

        // =======================
        // LOG DE MENSAJES
        // =======================
        try {
            const time = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const senderNum = getNumber(sender);
            const groupName = isGroup && metadata ? metadata.subject : "PRIVADO";

            let type = "DESCONOCIDO";
            const m = msg.message || {};
            if (m.conversation || m.extendedTextMessage) type = "TEXTO";
            else if (m.imageMessage) type = "IMAGEN";
            else if (m.videoMessage) type = "VIDEO";
            else if (m.stickerMessage) type = "STICKER";
            else if (m.audioMessage) type = "AUDIO";
            else if (m.documentMessage) type = "DOCUMENTO";
            else if (m.reactionMessage) type = "REACCIÓN";
            else if (m.viewOnceMessage || m.viewOnceMessageV2) type = "VIEWONCE";

            const preview = fixedText.length > 40 ? fixedText.slice(0, 40) + "..." : fixedText;
            console.log(`
╔════════════════════════════════════╗
║ 🕒 ${time}
║ 👤 ${senderNum}
║ 👥 ${groupName}
║ 📎 Tipo: ${type}
║ 💬 ${preview}
╚════════════════════════════════════╝
            `);
        } catch (e) { console.error("Error en log:", e); }

        // =======================
        // SISTEMA ANTILINK
        // =======================
        if (isGroup && fixedText) {
            const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;
            if (linkRegex.test(fixedText)) {
                if (!isAntilinkEnabled(jid) || isAdmin) return;
                try { await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: msg.key.id, participant: realSender } }); } catch {}
                if (isBotAdmin) {
                    try { await sock.groupParticipantsUpdate(jid, [realSender], "remove"); } catch {}
                }
                return;
            }
        }

        // =======================
        // SI NO ES COMANDO → onMessage
        // =======================
        if (!fixedText.startsWith(".")) {
            for (let name in plugins) {
                const plug = plugins[name];
                if (plug.onMessage) await plug.onMessage(sock, msg);
            }
            return;
        }

        // =======================
        // PROCESAR COMANDO
        // =======================
        const args = fixedText.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        const plugin = plugins[command];
        if (!plugin) return;

        // =======================
        // CONTEXTO
        // =======================
        const ctx = {
            sock,
            msg,
            jid,
            sender: realSender,
            isAdmin,
            isBotAdmin,
            isGroup,
            args,
            groupMetadata: metadata,
            participants: metadata?.participants || [],
            groupAdmins: admins,
            store,
            download: async () => {
                const m = msg.message;
                if (!m) throw new Error("NO_MEDIA");
                const media = m.imageMessage || m.videoMessage || m.stickerMessage || m.documentMessage || m.audioMessage;
                if (!media) throw new Error("NO_MEDIA");
                const stream = await downloadContentFromMessage(media, media.mimetype?.split("/")[0] || "file");
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                return buffer;
            }
        };

        // =======================
        // SISTEMA ON/OFF
        // =======================
        const state = getState(command);
        if (state === false) return sock.sendMessage(jid, { text: `⚠️ El comando *.${command}* está desactivado.` });

        // =======================
        // SOLO ADMINS
        // =======================
        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, { text: "❌ Solo administradores pueden usar este comando." });
        }

        // =======================
        // EJECUTAR COMANDO
        // =======================
        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
