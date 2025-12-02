export default {
    commands: ["qc"],
    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const sender = msg.pushName || "Usuario";

        if (!args.length)
            return sock.sendMessage(jid, { text: "✨ Escribe el texto para generar el QC.\n\nEjemplo:\n.qc Hola mundo" });

        const texto = args.join(" ");

        // Mensaje final tipo QC (solo texto)
        const qc = `
╔═══════════◆
╠✨ *QC DE:* ${sender}
╠💬 *MENSAJE:* ${texto}
╚═══════════◆
        `.trim();

        await sock.sendMessage(jid, { text: qc });
    }
};
