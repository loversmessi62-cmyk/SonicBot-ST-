import fs from "fs";
import path from "path";
import { getState } from "./utils/cdmtoggle.js";
import { isAntilinkEnabled } from "./utils/antilinkState.js";
import { isModoAdminsEnabled } from "./lib/modoadminsState.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { isMuted } from "./utils/muteState.js";

const groupCache = {};
const groupFetchLocks = {};

const getGroupMeta = async (sock, jid) => {
  if (groupCache[jid]) return groupCache[jid];
  if (groupFetchLocks[jid]) return groupFetchLocks[jid];

  groupFetchLocks[jid] = (async () => {
    try {
      const meta = await sock.groupMetadata(jid);
      groupCache[jid] = meta;
      setTimeout(() => delete groupCache[jid], 5 * 60 * 1000);
      return meta;
    } catch (e) {
      if (e?.data === 429) {
        console.log("🛑 RATE LIMIT — usando cache vieja");
        return groupCache[jid] || null;
      }
      return null;
    } finally {
      delete groupFetchLocks[jid];
    }
  })();

  return groupFetchLocks[jid];
};

console.log("🔥 handler.js cargado");

export const store = { chats: {} };

const storePath = "./store.json";
let saveStoreTimer = null;

const saveStore = () => {
  clearTimeout(saveStoreTimer);
  saveStoreTimer = setTimeout(() => {
    try {
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
    } catch (e) {
      console.error("❌ Error guardando store:", e);
    }
  }, 1500);
};

if (fs.existsSync(storePath)) {
  try {
    const old = JSON.parse(fs.readFileSync(storePath, "utf8"));
    Object.assign(store, old);
  } catch (e) {
    console.error("❌ store.json inválido:", e);
  }
}

export const plugins = {};

export const loadPlugins = async () => {
  try {
    const dir = "./plugins";
    if (!fs.existsSync(dir)) {
      console.warn("⚠️ La carpeta ./plugins no existe");
      return false;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

    for (const key of Object.keys(plugins)) {
      delete plugins[key];
    }

    for (const file of files) {
      try {
        console.log(`🔎 Cargando plugin: ${file}`);

        const module = await import(
          `file://${path.resolve(`./plugins/${file}`)}?update=${Date.now()}`
        );

        const plugin = module.default;

        const cmds =
          plugin?.commands ||
          plugin?.command ||
          plugin?.cmd ||
          [];

        const commandList = Array.isArray(cmds) ? cmds : [cmds];

        if (!commandList.length || !commandList[0]) continue;

        const isNewFormat =
          typeof plugin?.run === "function" ||
          typeof plugin?.onMessage === "function";

        const isOldFormat = typeof plugin === "function";

        if (!isNewFormat && !isOldFormat) continue;

        for (const cmd of commandList) {
          plugins[String(cmd).toLowerCase()] = plugin;
        }

        console.log(`🔥 Plugin cargado: ${file}`);
      } catch (err) {
        console.error(`❌ Error en plugin ${file}:`, err);
      }
    }

    console.log(`✅ Plugins recargados: ${Object.keys(plugins).length}`);
    return true;
  } catch (e) {
    console.error("❌ Error cargando plugins:", e);
    return false;
  }
};

const handler = async (sock, msg) => {
  try {
    const jid = msg.key.remoteJid;
    const isGroup = jid?.endsWith("@g.us");

    let realSender =
      msg.key.participant ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      jid;

    let metadata = null;
    let admins = [];
    let isAdmin = false;
    let isBotAdmin = false;

    const normalizeAll = value => {
      if (!value) return null;
      return value
        .toString()
        .replace(/@s\.whatsapp\.net/g, "")
        .replace(/@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/[^0-9]/g, "");
    };

    if (isGroup) {
      try {
        metadata = await getGroupMeta(sock, jid);

        const senderNum = normalizeAll(realSender);
        const botNum = normalizeAll(sock.user?.id);

        admins = metadata?.participants?.filter(
          p => p.admin === "admin" || p.admin === "superadmin"
        ) || [];

        const adminIds = admins
          .flatMap(p => [normalizeAll(p.id), normalizeAll(p.jid)])
          .filter(Boolean);

        isAdmin = adminIds.includes(senderNum);

        isBotAdmin = metadata?.participants?.some(p => {
          const pid = normalizeAll(p.id);
          const pjid = normalizeAll(p.jid);

          return (
            (p.admin === "admin" || p.admin === "superadmin") &&
            (pid === botNum || pjid === botNum)
          );
        }) || false;
      } catch {
        metadata = null;
      }
    }

    if (isGroup && isMuted(jid, realSender) && !isAdmin) {
      try {
        await sock.sendMessage(jid, {
          delete: {
            remoteJid: jid,
            fromMe: false,
            id: msg.key.id,
            participant: realSender
          }
        });
      } catch {}
      return;
    }

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    const fixedText = text || "";

    if (!fixedText.startsWith(".")) return;

    const args = fixedText.slice(1).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    const plugin = plugins[command];

    if (!plugin) return;

    if (isGroup && isModoAdminsEnabled(jid) && !isAdmin) {
      return sock.sendMessage(jid, {
        text: "🔒 Solo admins pueden usar comandos."
      });
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
      command,
      groupMetadata: metadata,
      participants: metadata?.participants || [],
      groupAdmins: admins,
      store,
      reloadPlugins: loadPlugins,
      download: async () => {
        const m = msg.message;
        if (!m) throw new Error("NO_MEDIA");

        const media =
          m.imageMessage ||
          m.videoMessage ||
          m.documentMessage ||
          m.audioMessage;

        if (!media) throw new Error("NO_MEDIA");

        const mediaType = Object.keys(m)
          .find(k => k.endsWith("Message"))
          ?.replace("Message", "")
          .toLowerCase() || "document";

        const stream = await downloadContentFromMessage(media, mediaType);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      }
    };

    const state = getState(command);

    if (state === false) {
      return sock.sendMessage(jid, {
        text: `⚠️ El comando *.${command}* está desactivado.`
      });
    }

    if (plugin.admin && !isAdmin) {
      return sock.sendMessage(jid, {
        text: "❌ Solo administradores pueden usar este comando."
      });
    }

    if (typeof plugin.run === "function") {
      await plugin.run(sock, msg, args, ctx);
      return;
    }

    if (typeof plugin === "function") {
      await plugin(msg, ctx);
      return;
    }
  } catch (e) {
    console.error("❌ ERROR EN HANDLER:", e);
  }
};

export default handler;