export default {
    commands: ["todos"],
    category: "info",

    async run(sock, msg, args, ctx) {
        try {
            const jid = ctx.jid;

            if (!ctx.isGroup) {
                return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
            }

            const metadata = ctx.groupMetadata;
            const groupName = metadata.subject;
            const participantes = metadata.participants.length;

            // Fecha bonita
            const fecha = new Date();
            const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const meses = [
                "Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
            ];

            const fechaBonita =
                `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;

            // Mensaje del usuario
            const textoUsuario = ctx.args.length
                ? ctx.args.join(" ")
                : "Aquí está la información del grupo.";

            const texto = 
`🌐 *INFORMACIÓN DEL GRUPO*

👥 *Grupo:* ${groupName}
📌 *Participantes:* ${participantes}
📅 *Fecha:* ${fechaBonita}

💬 *Mensaje:* ${textoUsuario}`;

            await sock.sendMessage(jid, { text: texto });

        } catch (err) {
            console.error("Error en .todos:", err);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ Error ejecutando el comando." });
        }
    }
};
