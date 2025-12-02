export default {
    commands: ["fantasmas", "kickfantasmas"],
    admin: true,

    async run(sock, msg, args, ctx) {
        const { jid, participants, store, isBotAdmin } = ctx;
        const command = ctx.msg.message.conversation?.slice(1).split(" ")[0].toLowerCase();

        // asegurar datos
        if (!store.chats[jid]) store.chats[jid] = {};

        const chat = store.chats[jid];

        // lista exacta de fantasmas
        const inactivos = participants.filter(p => {
            const id = p.id;
            const count = chat[id] || 0;
            return count === 0;   // nunca hicieron NADA
        });

        // --- comando .fantasmas ---
        if (command === "fantasmas") {
            if (inactivos.length === 0) {
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas en este grupo." });
            }

            const tags = inactivos.map(u => `@${u.id.split("@")[0]}`).join("\n");

            return sock.sendMessage(jid, {
                text: `🕯️ *FANTASMAS DEL GRUPO*\n\n${tags}\n\n⚠️ No han enviado ni una reacción, sticker, mensaje, imagen o nada.`,
                mentions: inactivos.map(u => u.id)
            });
        }

        // --- comando .kickfantasmas ---
        if (command === "kickfantasmas") {

            if (!isBotAdmin)
                return sock.sendMessage(jid, { text: "❌ Necesito ser administrador para expulsarlos." });

            if (inactivos.length === 0)
                return sock.sendMessage(jid, { text: "✨ No hay fantasmas que expulsar." });

            const ids = inactivos.map(u => u.id);

            await sock.sendMessage(jid, {
                text: `🗑️ *Expulsando fantasmas…*\n\n${ids.map(x => `@${x.split("@")[0]}`).join("\n")}`,
                mentions: ids
            });

            try {
                await sock.groupParticipantsUpdate(jid, ids, "remove");
            } catch (e) {
                console.log("❌ Error expulsando fantasmas:", e);
            }
        }
    }
};
