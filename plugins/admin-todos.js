export default {
    commands: ["todos"],
    admin: true,   // Solo para admins

    async run(sock, msg, args, ctx) {

        // -----------------------
        // OBTENER JID DEL REMITENTE (CORREGIDO)
        // -----------------------

        let sender = msg.sender || msg.key.participant || msg.participant;

        if (!sender) {
            sender = msg.key.remoteJid;
        }

        // limpiar IDs raros tipo "1203:17@s.whatsapp.net"
        sender = sender.replace(/:.*@/g, "@");

        // quitar @ del final para comparar
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
                text: "❌ *Este comando es solo para administradores del grupo.*"
            });
        }

        // -----------------------
        // ENVIAR MENSAJE A TODOS
        // -----------------------

        const texto = args.join(" ") || "Mensaje para todos 👇";
        const menciones = ctx.groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(msg.key.remoteJid, {
            text: `📣 *MENSAJE DEL ADMIN*\n\n${texto}`,
            mentions: menciones
        }, { quoted: msg });
    }
};
