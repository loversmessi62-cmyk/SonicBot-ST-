export default {
    commands: ["n"],
    category: "admin",
    admin: true, // Solo admins

    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        let texto = args.join(" ").trim();

        const isQuoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedInfo = msg.message?.extendedTextMessage?.contextInfo;

        let mentions = [];

        // ===============================
        // 1. SI RESPONDES A UN MENSAJE
        // ===============================
        if (isQuoted) {
            const quoted = quotedInfo.quotedMessage;

            // Si el mensaje citado era de alguien → lo mencionamos
            if (quotedInfo.participant) {
                mentions.push(quotedInfo.participant);
            }

            // Sacar texto del mensaje citado
            texto =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                texto;
        }

        // ===============================
        // 2. SI ESCRIBISTE @NUMERO EN EL COMANDO
        // ===============================
        const posiblesMenciones = texto.match(/@(\d+)/g);

        if (posiblesMenciones) {
            for (let tag of posiblesMenciones) {
                const numero = tag.replace("@", "") + "@s.whatsapp.net";
                mentions.push(numero);
            }
        }

        // ===============================
        // 3. SI NO HAY TEXTO → ERROR
        // ===============================
        if (!texto) {
            return await sock.sendMessage(
                jid,
                { text: "⚠️ Escribe un mensaje o responde alguno." },
                { quoted: msg }
            );
        }

        // ===============================
        // 4. ENVIAR MENSAJE CON MENCIONES
        // ===============================
        await sock.sendMessage(
            jid,
            {
                text: texto,
                mentions
            },
            { quoted: msg }
        );
    }
};
