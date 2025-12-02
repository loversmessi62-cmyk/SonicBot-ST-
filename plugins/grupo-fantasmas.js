export default {
    commands: ["fantasmas", "kickfantasmas"],
    admin: true, // solo admins
    category: "grupo",

    async run(sock, msg, args, ctx) {
        const { jid, groupMetadata, store, isBotAdmin, sock: client } = ctx;

        if (!ctx.isGroup)
            return client.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        if (!isBotAdmin)
            return client.sendMessage(jid, { text: "❌ Necesito ser administrador para usar esto." });

        const participantes = groupMetadata.participants;
        const registros = store.chats[jid] || {};

        // =============================================
        //                COMANDO: .fantasmas
        // =============================================
        if (ctx.command === "fantasmas") {
            let inactivos = [];

            for (let user of participantes) {
                const id = user.id;
                const msgs = registros[id] || 0;

                if (msgs < 5) { // 🔥 menos de 5 mensajes = fantasma
                    inactivos.push(id);
                }
            }

            if (inactivos.length === 0) {
                return client.sendMessage(jid, { text: "🟢 No hay fantasmas. Todos están activos." });
            }

            const lista = inactivos
                .map(u => `• @${u.split("@")[0]}`)
                .join("\n");

            return client.sendMessage(jid, {
                text:
`👻 *FANTASMAS DETECTADOS*
Usuarios con muy poca actividad:

${lista}

Usa *.kickfantasmas* para expulsarlos.`,
                mentions: inactivos
            });
        }

        // =============================================
        //             COMANDO: .kickfantasmas
        // =============================================
        if (ctx.command === "kickfantasmas") {

            let inactivos = [];

            for (let user of participantes) {
                const id = user.id;
                const msgs = registros[id] || 0;

                if (msgs < 5) {
                    inactivos.push(id);
                }
            }

            if (inactivos.length === 0) {
                return client.sendMessage(jid, { text: "🟢 No hay fantasmas para expulsar." });
            }

            await client.sendMessage(jid, {
                text: `👻 Expulsando a ${inactivos.length} fantasmas...`
            });

            for (let user of inactivos) {
                try {
                    await client.groupParticipantsUpdate(jid, [user], "remove");
                } catch (e) {
                    console.log("No se pudo expulsar:", user);
                }
            }

            return client.sendMessage(jid, {
                text: "✅ *Fantasmas expulsados correctamente.*"
            });
        }
    }
};
