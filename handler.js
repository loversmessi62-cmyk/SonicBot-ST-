import fs from "fs";
import path from "path";
import { getState } from "./utils/cmdToggle.js";

export const plugins = {};

export const loadPlugins = async () => {
    try {
        const dir = "./plugins";
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

        for (let file of files) {
            const module = await import("file://" + path.resolve(`./plugins/${file}`));
            const cmds = module.default.commands;

            cmds.forEach(cmd => plugins[cmd] = module.default);

            console.log(`🔥 Plugin cargado: ${file}`);
        }
    } catch (e) {
        console.error("❌ Error cargando plugins:", e);
    }
};


// =====================================================
//        ⚡ HANDLER PRINCIPAL (FIX ADMIN LID)
// =====================================================

export const handleMessage = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");

        // JID ORIGINAL DEL SENDER
        const sender = msg.key.participant || msg.key.remoteJid;

        let metadata = null;
        let admins = [];
        let isAdmin = false;

        // LID REAL DEL SENDER
        let realSender = sender;

        if (isGroup) {

            metadata = await sock.groupMetadata(jid);

            // Buscar el participante para obtener el LID correcto
            const found = metadata.participants.find(p =>
                p.jid === sender || p.id === sender
            );

            if (found) realSender = found.id;

            // LISTA DE ADMINS (LID)
            admins = metadata.participants
                .filter(p => p.admin)
                .map(p => p.id);

            isAdmin = admins.includes(realSender);

            
        }

        // -----------------------
        //   TEXTO & COMANDO
        // -----------------------
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";
// ===================================
//          SISTEMA ANTILINK
// ===================================
if (isGroup && getState("antilink")) {

    const linkRegex = /(https?:\/\/[^\s]+)/gi;

    const textMsg =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        "";

    if (linkRegex.test(textMsg)) {

        // No expulsar admins
        if (isAdmin) {
            await sock.sendMessage(jid, {
                text: "⚠️ *Antilink activo, pero eres admin. No te expulso.*"
            });
            return;
        }

        // 1️⃣ BORRAR el mensaje
        try {
            await sock.sendMessage(jid, {
                delete: msg.key
            });
        } catch (e) {
            console.log("❌ Error al borrar mensaje:", e);
        }

        // 2️⃣ Avisar + Expulsar al usuario
        await sock.sendMessage(jid, {
            text: `🚫 *Se detectó un link prohibido*\nEliminando a @${msg.sender.split("@")[0]}…`,
            mentions: [msg.sender]
        });

        try {
            await sock.groupParticipantsUpdate(
                jid,
                [msg.sender],
                "remove"
            );
        } catch (e) {
            console.log("❌ Error expulsando usuario:", e);
        }

        return;
    }
}

        if (!text.startsWith(".")) {

            // ============================================================
            //  🔥 AQUI AGREGO onMessage() — SIN CAMBIAR NADA TUYO
            // ============================================================
            for (let name in plugins) {
                const plug = plugins[name];
                if (plug.onMessage) {
                    await plug.onMessage(sock, msg, {
                        sender: realSender,
                        isAdmin,
                        isGroup,
                        groupMetadata: metadata,
                        plugins
                    });
                }
            }
            // ============================================================

            return;
        }

        const args = text.slice(1).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!plugins[command]) return;

        const plugin = plugins[command];

        // --------------------------------------
        //    VERIFICAR SI EL COMANDO ESTÁ ON/OFF
        // --------------------------------------
        if (!getState(command)) {
            return sock.sendMessage(jid, {
                text: `⚠️ El comando *.${command}* está desactivado.`
            });
        }


        // --------------------------------------
        //     PROTECCIÓN SOLO ADMIN (ARREGLADO)
        // --------------------------------------
        if (plugin.admin && !isAdmin) {
            return sock.sendMessage(jid, {
                text: "❌ *Solo los administradores pueden usar este comando.*"
            });
        }

        const ctx = {
            sender: realSender,
            isAdmin,
            isGroup,
            groupMetadata: metadata,
            plugins
        };

        await plugin.run(sock, msg, args, ctx);

    } catch (e) {
        console.error("❌ ERROR EN HANDLER:", e);
    }
};
