import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { isMuted } from "./utils/muteState.js";
import { isAntilinkEnabled } from "./utils/antilinkState.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const groupCache = {};

// ==================================================
// 📦 STORE GLOBAL
// ==================================================
export const store = { chats: {} };

if (fs.existsSync("./store.json")) {
    Object.assign(store, JSON.parse(fs.readFileSync("./store.json")));
}

// ==================================================
// 🔌 PLUGINS
// ==================================================
export const plugins = {};

export const loadPlugins = async () => {
    const files = fs.readdirSync("./plugins").filter(f => f.endsWith(".js"));
    for (const file of files) {
        const mod = await import("file://" + path.resolve("./plugins/" + file));
        const cmds = mod.default.commands || mod.default.command;
        if (!cmds) continue;
        cmds.forEach(c => plugins[c] = mod.default);
        console.log(`✅ Plugin cargado: ${file}`);
    }
};

// ==================================================
// ⚡ HANDLER PRINCIPAL – ADRIBOT
// ==================================================
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

        // ================= ADMINS =================
        if (isGroup) {
            if (!groupCache[jid]) {
                groupCache[jid] = await sock.groupMetadata(jid);
            }
            metadata = groupCache[jid];

            const p = metadata.participants.find(x => x.id === sender || x.jid === sender);
            if (p) realSender = p.id;

            admins = metadata.participants.filter(p => p.admin).map(p => p.id);
            isAdmin = admins.includes(realSender);

            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            isBotAdmin = admins.includes(botId);
        }

        // ================= 🔇 MUTE =================
        if (isGroup && isMuted(jid, realSender) && !isAdmin) {
            await sock.sendMessage(jid, {
                delete: {
                    remoteJid: jid,
                    fromMe: false,
                    id: msg.key.id,
                    participant: realSender
                }
            }).catch(() => {});
            return;
        }

        // ================= TEXTO =================
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            "";

        const fixedText = text || "";

        // ================= ANTILINK =================
        if (isGroup && fixedText) {
            const link = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;
            if (link.test(fixedText)) {
                if (!isAntilinkEnabled(jid)) return;
                if (isAdmin) return;

                await sock.sendMessage(jid, {
                    delete: {
                        remoteJid: jid,
                        fromMe: false,
                        id: msg.key.id,
                        participant: realSender
                    }
                }).catch(() => {});

                if (isBotAdmin) {
                    await sock.groupParticipantsUpdate(jid, [realSender], "remove")
                        .catch(() => {});
                }
                return;
            }
        }

        // ================= NO COMANDO =================
        if (!fixedText.startsWith(".")) {
            for (const p of Object.values(plugins)) {
                if (p.onMessage) await p.onMessage(sock, msg);
            }
            return;
        }

        // ================= COMANDO =================
        const args = fixedText.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        if (!plugins[command]) return;

        const plugin = plugins[command];

        if (getState(command) === false) {
            return sock.sendMessage(jid, { text: `⚠️ Comando .${command} desactivado` });
        }

        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, { text: "❌ Solo admins" });
        }

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
                const media =
                    m.imageMessage ||
                    m.videoMessage ||
                    m.documentMessage ||
                    m.audioMessage;
                if (!media) throw new Error("NO_MEDIA");

                const stream = await downloadContentFromMessage(
                    media,
                    media.mimetype.split("/")[0]
                );
                let buf = Buffer.from([]);
                for await (const c of stream) buf = Buffer.concat([buf, c]);
                return buf;
            }
        };

        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ HANDLER ERROR:", e);
    }
};
