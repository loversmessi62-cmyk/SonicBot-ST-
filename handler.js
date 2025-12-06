import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// =========================================================
//                   📌 STORE GLOBAL
// =========================================================
export const store = {
    chats: {}, // jid → { user → count }
};

// Guardar store en disco (opcional)
const saveStore = () => {
    fs.writeFileSync("./store.json", JSON.stringify(store, null, 2));
};

// Cargar store si existe
if (fs.existsSync("./store.json")) {
    const old = JSON.parse(fs.readFileSync("./store.json"));
    Object.assign(store, old);
}

// ============================================
//              SISTEMA DE PLUGINS
// ============================================
export const plugins = {};

export const loadPlugins = async () => {
    try {
        const dir = "./plugins";
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

        for (let file of files) {
            try {
                console.log(`🔎 Cargando plugin: ${file}`);

                const module = await import("file://" + path.resolve(`./plugins/${file}`));
                const cmds = module.default.commands || module.default.command;

                if (!cmds) {
                    console.warn(`⚠️ ${file} no tiene "command" ni "commands"`);
                    continue;
                }

                cmds.forEach(cmd => plugins[cmd] = module.default);
                console.log(`🔥 Plugin cargado: ${file}`);

            } catch (err) {
                console.error(`❌ Error en plugin ${file}:`, err);
            }
        }
    } catch (e) {
        console.error("❌ Error cargando plugins:", e);
    }
};


// =====================================================
//               ⚡ HANDLER PRINCIPAL FIX ⚡
// =====================================================
export const handleMessage = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        const sender = msg.key.participant || msg.key.remoteJid;
        let realSender = sender;

        let metadata = null;
        let admins = [];
        let isAdmin = false;
        let isBotAdmin = false;

        // =====================================
        //           SISTEMA DE ADMINS
        // =====================================
        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            const found = metadata.participants.find(
                p => p.jid === sender || p.id === sender
            );
            if (found) realSender = found.id;

            admins = metadata.participants
                .filter(p => p.admin)
                .map(p => p.id);

            isAdmin = admins.includes(realSender);

            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            isBotAdmin = admins.includes(botId);
        }

        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

        // =========================================================
        //       📌 CONTADOR REAL DE ACTIVIDAD
        // =========================================================
        if (isGroup) {

            if (!store.chats[jid]) store.chats[jid] = {};

            const chat = store.chats[jid];

            // Inicializar
            if (!chat[realSender]) chat[realSender] = 0;

            const m = msg.message || {};

            const hizoAlgo =
                m.conversation ||
                m.extendedTextMessage ||
                m.imageMessage ||
                m.videoMessage ||
                m.stickerMessage ||
                m.documentMessage ||
                m.audioMessage ||
                m.contactMessage ||
                m.locationMessage ||
                m.liveLocationMessage ||
                m.viewOnceMessage ||
                m.viewOnceMessageV2 ||
                m.reactionMessage;

            if (hizoAlgo) {
                chat[realSender]++;
                saveStore();
            }
        }

        // =========================================================
        //              SISTEMA ANTILINK
        // =========================================================
        if (isGroup && getState("antilink")) {
            const linkRegex = /(https?:\/\/[^\s]+)/gi;

            if (linkRegex.test(text)) {

                if (isAdmin) {
                    await sock.sendMessage(jid, {
                        text: "⚠️ Antilink activo, pero eres admin."
                    });
                    return;
                }

                try { await sock.sendMessage(jid, { delete: msg.key }); }
                catch (e) { console.log("❌ No se pudo borrar mensaje:", e); }

                await sock.sendMessage(jid, {
                    text: `🚫 Link detectado, expulsando a @${realSender.split("@")[0]}`,
                    mentions: [realSender]
                });

                try {
                    await sock.groupParticipantsUpdate(jid, [realSender], "remove");
                } catch (e) {
                    console.log("❌ No se pudo expulsar:", e);
                }

                return;
            }
        }

        // ==================================================
        //       SI NO ES COMANDO → ejecutar "onMessage"
        // ==================================================
        if (!text.startsWith(".")) {
            for (let name in plugins) {
                const plug = plugins[name];
                if (plug.onMessage) {
                    await plug.onMessage(sock, msg);
                }
            }
            return;
        }

        // ===============================
        //        PROCESAR COMANDO
        // ===============================
        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!plugins[command]) return;

        const plugin = plugins[command];

        // ============= DETECTAR MEDIA CORRECTAMENTE =============
        function getMediaMessage(m) {

            if (!m?.message) return null;

            const msg = m.message;

            const direct =
                msg.imageMessage ||
                msg.videoMessage ||
                msg.stickerMessage ||
                msg.documentMessage ||
                msg.audioMessage;

            if (direct) {
                return [
                    direct.mimetype?.split("/")[0] || "file",
                    direct
                ];
            }

            const vo = msg.viewOnceMessageV2?.message || msg.viewOnceMessage?.message;

            if (vo) {
                const voMedia = vo.imageMessage || vo.videoMessage;
                if (voMedia) {
                    return [
                        voMedia.mimetype?.split("/")[0] || "file",
                        voMedia
                    ];
                }
            }

            const ctx =
                msg?.extendedTextMessage?.contextInfo ||
                msg?.imageMessage?.contextInfo ||
                msg?.videoMessage?.contextInfo ||
                msg?.documentMessage?.contextInfo ||
                msg?.stickerMessage?.contextInfo ||
                msg?.audioMessage?.contextInfo;

            const quoted = ctx?.quotedMessage;
            if (quoted) {

                const qMedia =
                    quoted.imageMessage ||
                    quoted.videoMessage ||
                    quoted.stickerMessage ||
                    quoted.documentMessage ||
                    quoted.audioMessage;

                if (qMedia) {
                    return [
                        qMedia.mimetype?.split("/")[0] || "file",
                        qMedia
                    ];
                }
            }

            return null;
        }

        // ===============================
        //      CONTEXTO (ctx)
        // ===============================
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
        try {
            const detected = getMediaMessage(msg);

            if (!detected) throw new Error("NO_MEDIA_FOUND");

            const [type, media] = detected;

            // 📌 Detectar tipo real cuando sea TXT, PDF, DOCX, etc.
            let realType = type;
            if (media.mimetype?.startsWith("text")) realType = "document";
            if (media.mimetype?.includes("application")) realType = "document";

            const stream = await downloadContentFromMessage(media, realType);

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            return buffer;

        } catch (e) {
            console.error("⛔ Error en ctx.download:", e);
            throw e;
        }
    }
};

        // =====================================================
        //              SISTEMA ON/OFF
        // =====================================================
        try {
            const state = getState(command);
            if (state === false) {
                return sock.sendMessage(jid, {
                    text: `⚠️ El comando *.${command}* está desactivado.`
                });
            }
        } catch (e) {
            console.error("Error verificando on/off:", e);
        }

        // ===============================
        //   PROTECCIÓN SOLO ADMIN
        // ===============================
        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, {
                text: "❌ Solo administradores pueden usar este comando."
            });
        }

        // ===============================
        //         EJECUTAR COMANDO
        // ===============================
        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
