import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { isMuted } from "./utils/muteState.js";
import { isAntilinkEnabled } from "./utils/antilinkState.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// =========================================================
//                   📌 STORE GLOBAL
// =========================================================
export const store = {
    chats: {},
};

// =========================================================
//              SISTEMA DE PLUGINS
// =========================================================
export const plugins = {};

export const loadPlugins = async () => {
    const dir = "./plugins";
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

    for (const file of files) {
        try {
            const module = await import("file://" + path.resolve(`${dir}/${file}`));
            const cmds = module.default.commands || module.default.command;

            if (!cmds) continue;

            for (const c of Array.isArray(cmds) ? cmds : [cmds]) {
                plugins[c] = module.default;
            }

            console.log(`✅ Plugin cargado: ${file}`);
        } catch (e) {
            console.error(`❌ Error en plugin ${file}:`, e);
        }
    }
};

// =====================================================
//               ⚡ HANDLER PRINCIPAL ⚡
// =====================================================
export const handleMessage = async (sock, msg) => {
    try {
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        const sender = msg.key.participant || msg.key.remoteJid;
        let metadata = null;
        let admins = [];
        let isAdmin = false;
        let isBotAdmin = false;

        // =====================================
        //           METADATA REAL (SIEMPRE)
        // =====================================
        if (isGroup) {
            metadata = await sock.groupMetadata(jid);

            admins = metadata.participants
                .filter(p => p.admin)
                .map(p => p.id);

            isAdmin = admins.includes(sender);

            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            isBotAdmin = admins.includes(botId);
        }

        // ===============================
        // 🔇 SISTEMA MUTE REAL
        // ===============================
        if (isGroup && isMuted(jid, sender) && !isAdmin) {
            try {
                await sock.sendMessage(jid, {
                    delete: {
                        remoteJid: jid,
                        fromMe: false,
                        id: msg.key.id,
                        participant: sender
                    }
                });
            } catch {}
            return;
        }

        // ===============================
        //       TEXTO NORMALIZADO
        // ===============================
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            msg.message?.buttonsResponseMessage?.selectedButtonId ||
            msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            msg.message?.templateButtonReplyMessage?.selectedId ||
            "";

        // ===============================
        //          ANTILINK
        // ===============================
        if (isGroup && text) {
            const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

            if (
                linkRegex.test(text) &&
                isAntilinkEnabled(jid) &&
                !isAdmin
            ) {
                try {
                    await sock.sendMessage(jid, {
                        delete: {
                            remoteJid: jid,
                            fromMe: false,
                            id: msg.key.id,
                            participant: sender
                        }
                    });
                } catch {}

                if (isBotAdmin) {
                    try {
                        await sock.groupParticipantsUpdate(jid, [sender], "remove");
                    } catch {}
                }
                return;
            }
        }

        // ===============================
        //      NO ES COMANDO
        // ===============================
        if (!text || !text.startsWith(".")) {
            for (const p of Object.values(plugins)) {
                if (p.onMessage) await p.onMessage(sock, msg);
            }
            return;
        }

        // ===============================
        //        COMANDO
        // ===============================
        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!plugins[command]) return;
        const plugin = plugins[command];

        // ===============================
        //      ON / OFF GLOBAL
        // ===============================
        if (getState(command) === false) {
            return sock.sendMessage(jid, {
                text: `⚠️ El comando *.${command}* está desactivado.`
            });
        }

        // ===============================
        //      SOLO ADMINS
        // ===============================
        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, {
                text: "❌ Este comando es solo para administradores."
            });
        }

        // ===============================
        //      CONTEXTO
        // ===============================
        const ctx = {
            sock,
            msg,
            jid,
            sender,
            isAdmin,
            isBotAdmin,
            isGroup,
            args,
            groupMetadata: metadata,
            participants: metadata?.participants || [],
            groupAdmins: admins,
            store,
            download: async () => {
                const media =
                    msg.message.imageMessage ||
                    msg.message.videoMessage ||
                    msg.message.audioMessage ||
                    msg.message.stickerMessage ||
                    msg.message.documentMessage;

                if (!media) throw new Error("NO_MEDIA");

                const stream = await downloadContentFromMessage(
                    media,
                    media.mimetype.split("/")[0]
                );

                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            }
        };

        // ===============================
        //      EJECUTAR
        // ===============================
        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR HANDLER:", e);
    }
};
