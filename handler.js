// =========================
//      HANDLER GLOBAL
// =========================

sock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message) return;

        // Tipo de mensaje y contexto
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const senderJid = m.key.participant || m.key.remoteJid;
        
        // Normalizar JID (usa solo números)
        const normalizarID = (jid) => jid.split("@")[0].replace(/\D/g, "");

        const sender = normalizarID(senderJid);

        let groupMetadata = {};
        let participants = [];
        let admins = [];
        let isAdmin = false;

        // =========================
        //   INFO DE GRUPO / ADMINS
        // =========================
        if (isGroup) {
            groupMetadata = await sock.groupMetadata(from);
            participants = groupMetadata.participants || [];

            // Obtener admins reales
            admins = participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => p.id.split("@")[0]);

            isAdmin = admins.includes(sender);
        }

        // =========================
        //   EXTRAER COMMAND
        // =========================

        const body = 
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            "";

        const prefix = ".";
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";
        const args = body.trim().split(/ +/).slice(1);

        // =========================
        //   LOG IMPORTANTE
        // =========================
        console.log(`
=======================
📌 INFO DEL MENSAJE
=======================
👤 Sender JID: ${senderJid}
🔢 Sender Normalizado: ${sender}
🏷️ Grupo: ${isGroup ? groupMetadata.subject : "Privado"}

👥 Participantes RAW:
${JSON.stringify(participants, null, 2)}

👑 ADMINS:
${JSON.stringify(admins, null, 2)}

🛡️ ¿ERES ADMIN?: ${isAdmin}
=======================
        `);

        // =========================
        //   SISTEMA DE COMANDOS
        // =========================

        // Ejemplo de comando normal
        if (command === "hola") {
            return sock.sendMessage(from, { text: "¡Hola bro! 😎" });
        }

        // Ejemplo de comando SOLO admins
        if (command === "ban") {
            if (!isGroup) return sock.sendMessage(from, { text: "❌ Este comando solo funciona en grupos." });
            if (!isAdmin) return sock.sendMessage(from, { text: "❌ Solo los *admins* pueden usar este comando." });

            return sock.sendMessage(from, { text: "✔ Usuario sido baneado (ejemplo)" });
        }

    } catch (e) {
        console.error("❌ ERROR EN EL HANDLER:", e);
    }
});
// =========================
//      HANDLER GLOBAL
// =========================

sock.ev.on("messages.upsert", async (chatUpdate) => {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message) return;

        // Tipo de mensaje y contexto
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const senderJid = m.key.participant || m.key.remoteJid;
        
        // Normalizar JID (usa solo números)
        const normalizarID = (jid) => jid.split("@")[0].replace(/\D/g, "");

        const sender = normalizarID(senderJid);

        let groupMetadata = {};
        let participants = [];
        let admins = [];
        let isAdmin = false;

        // =========================
        //   INFO DE GRUPO / ADMINS
        // =========================
        if (isGroup) {
            groupMetadata = await sock.groupMetadata(from);
            participants = groupMetadata.participants || [];

            // Obtener admins reales
            admins = participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => p.id.split("@")[0]);

            isAdmin = admins.includes(sender);
        }

        // =========================
        //   EXTRAER COMMAND
        // =========================

        const body = 
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            "";

        const prefix = ".";
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";
        const args = body.trim().split(/ +/).slice(1);

        // =========================
        //   LOG IMPORTANTE
        // =========================
        console.log(`
=======================
📌 INFO DEL MENSAJE
=======================
👤 Sender JID: ${senderJid}
🔢 Sender Normalizado: ${sender}
🏷️ Grupo: ${isGroup ? groupMetadata.subject : "Privado"}

👥 Participantes RAW:
${JSON.stringify(participants, null, 2)}

👑 ADMINS:
${JSON.stringify(admins, null, 2)}

🛡️ ¿ERES ADMIN?: ${isAdmin}
=======================
        `);

        // =========================
        //   SISTEMA DE COMANDOS
        // =========================

        // Ejemplo de comando normal
        if (command === "hola") {
            return sock.sendMessage(from, { text: "¡Hola bro! 😎" });
        }

        // Ejemplo de comando SOLO admins
        if (command === "ban") {
            if (!isGroup) return sock.sendMessage(from, { text: "❌ Este comando solo funciona en grupos." });
            if (!isAdmin) return sock.sendMessage(from, { text: "❌ Solo los *admins* pueden usar este comando." });

            return sock.sendMessage(from, { text: "✔ Usuario sido baneado (ejemplo)" });
        }

    } catch (e) {
        console.error("❌ ERROR EN EL HANDLER:", e);
    }
});
