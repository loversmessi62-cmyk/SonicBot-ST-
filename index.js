    // ====================
    // Manejo de mensajes
    // ====================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        let msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        const sender = msg.key.participant || msg.key.remoteJid;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const prefix = config.prefix;
        if (!text.startsWith(prefix)) return;

        const [command, ...args] = text
            .slice(prefix.length)
            .trim()
            .split(/\s+/);

        // === EXTRA: Obtener metadata del grupo ===
        let groupMetadata = null;
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            groupMetadata = await sock.groupMetadata(from);

            const admins = groupMetadata.participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => p.id);

            isAdmin = admins.includes(sender);
            isBotAdmin = admins.includes(sock.user.id);
        }

        // Ejecutar plugin
        for (let plugin of Object.values(plugins)) {
            if (!plugin.commands) continue;

            if (plugin.commands.includes(command)) {
                try {
                    await plugin.run(sock, msg, args, {
                        isGroup,
                        isAdmin,
                        isBotAdmin,
                        groupMetadata,
                        prefix
                    });
                } catch (e) {
                    console.log("❌ Error en plugin:", e);
                }
            }
        }
    });
