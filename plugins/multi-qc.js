export default {
    commands: ["qc"],
    async run(sock, msg, args, ctx) {
        const jid = msg.key.remoteJid;
        const sender = msg.pushName || "Usuario";

        if (!args.length)
            return sock.sendMessage(jid, { text: "✨ Escribe un texto.\nEj: .qc Hola" });

        const texto = args.join(" ");

        // ======== IMAGEN BASE 600x600 (PNG en blanco) ============
        const blankPng = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAYAAAA8AXHiAAAABmJLR0QA/wD/AP+gvaeTAAACQElEQVR4nO3QQREAAAgEIE1u9Fh7hA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgN8BMAABYyqnKAAAAAElFTkSuQmCC",
            "base64"
        );

        // =================== TEXTO BONITO ===================
        const content =
`┏━━━━━━━━━━━━━━━━━━┓
✨ *QC DE:* ${sender}
💬 *MENSAJE:* ${texto}
┗━━━━━━━━━━━━━━━━━━┛`;

        // =================== CONVERTIR A STICKER ===================
        await sock.sendMessage(jid, {
            sticker: blankPng,
            caption: content
        });

    }
};
