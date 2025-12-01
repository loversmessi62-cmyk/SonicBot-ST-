export default {
    commands: ["todos"],
    admin: true, // Solo admin
    category: "administración",

    async run(sock, msg, args, ctx) {
        try {
            const { jid, isGroup, groupMetadata } = ctx;

            if (!isGroup) {
                return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
            }

            const nombreGrupo = groupMetadata.subject;
            const total = groupMetadata.participants.length;

            // Fecha bonita
            const fecha = new Date();
            const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
            const meses = [
                "Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
            ];

            const fechaBonita = `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;

            const mensaje = args.join(" ") || "Aquí está la información del grupo.";

            const texto = 
`📢 *MENSAJE PARA TODOS LOS MIEMBROS*

👥 *Grupo:* ${nombreGrupo}
📌 *Participantes:* ${total}
📅 *Día:* ${fechaBonita}

💬 *Mensaje del admin:* 
${mensaje}
`;

            await sock.sendMessage(jid, { text: texto });

        } catch (err) {
            console.error("Error en admin-todos:", err);
            await sock.sendMessage(ctx.jid, { text: "❌ Hubo un error ejecutando este comando." });
        }
    }
};
