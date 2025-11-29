export default {
    commands: ["n"],
    admin: true, // Solo for admins

    async run(sock, msg, args, ctx) {

        // -----------------------
        // OBTENER JID REAL DEL REMITENTE
        // -----------------------
        let sender = msg.sender || msg.key.participant || msg.participant;

        if (!sender) sender = msg.key.remoteJid;

        // quitar formatos raros tipo 12034:12@s.whatsapp.net
        sender = sender.replace(/:.*@/g, "@");

        const senderNumber = sender.split("@")[0];

        // -----------------------
        // DETECTAR ADMINS
        // -----------------------
        const admins = ctx.groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id.split("@")[0]);

        const isAdmin = admins.includes(senderNumber);

        if (!isAdmin) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: "❌ *Este comando solo puede ser usado por administradores del grupo.*"
            });
        }

        // -----------------------
        // ENVIAR MENSAJE
        // -----------------------
        const texto = args.join(" ") || "Aviso importante";

        await sock.sendMessage(msg.key.remoteJid, {
            text: `📢 *AVISO DEL ADMIN*\n\n${texto}`
        }, { quoted: msg });
    }
};
