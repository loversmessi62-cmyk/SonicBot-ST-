export default {
    commands: ["qc"],

    async run(sock, msg, args, ctx) {
        try {
            const jid = msg.key.remoteJid;

            // --- 1. SI ES RESPUESTA ---
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            let textoQC = null;

            if (quoted?.conversation) {
                textoQC = quoted.conversation;
            }

            // --- 2. SI SE ENVÍA .qc mensaje ---
            if (!textoQC && args.length > 0) {
                textoQC = args.join(" ");
            }

            // --- 3. SI NO HAY NADA ---
            if (!textoQC) {
                return sock.sendMessage(jid, {
                    text: "❌ Escribe un texto o responde a un mensaje.\n\nEjemplos:\n• *.qc hola*\n• *Responde y manda .qc*"
                }, { quoted: msg });
            }

            // FORMATO DEL QC (puedes editarlo)
            const output = `
╔══ 🎨 *QC TEXT* ══╗
👤 Usuario: @${(msg.key.participant || msg.key.remoteJid).split("@")[0]}
💬 Mensaje:
${textoQC}
╚══════════════════╝
`.trim();

            // ENVIAR
            await sock.sendMessage(jid, { text: output, mentions: [msg.key.participant] }, { quoted: msg });

        } catch (e) {
            console.error("QC Error:", e);
            await sock.sendMessage(jid, { text: "❌ Error al generar el QC." }, { quoted: msg });
        }
    }
};
