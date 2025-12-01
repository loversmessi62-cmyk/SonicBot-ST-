export default {
    commands: ["todos"],
    category: "info",

    async run(sock, msg, args, ctx) {
        try {
            const jid = msg.key.remoteJid;

            if (!ctx.isGroup) {
                return await sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
            }

            // INFO DEL GRUPO
            const groupMetadata = await sock.groupMetadata(jid);
            const groupName = groupMetadata.subject;
            const participantes = groupMetadata.participants?.length || 0;

            // FECHA DEL DÍA
            const fecha = new Date();
            const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const meses = [
                "Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
            ];

            const diaSemana = dias[fecha.getDay()];
            const dia = fecha.getDate();
            const mes = meses[fecha.getMonth()];
            const año = fecha.getFullYear();

            const fechaBonita = `${diaSemana}, ${dia} de ${mes} ${año}`;

            // MENSAJE QUE MANDA EL USUARIO
            const mensaje = args.length > 0 ? args.join(" ") : "¡Aquí está la info del grupo!";

            // MENSAJE FINAL
            const texto = `🌐 *INFORMACIÓN DEL GRUPO*\n\n` +
                `👥 *Grupo:* ${groupName}\n` +
                `📌 *Participantes:* ${participantes}\n` +
                `📅 *Fecha:* ${fechaBonita}\n\n` +
                `💬 *Mensaje:* ${mensaje}`;

            await sock.sendMessage(jid, { text: texto });

        } catch (e) {
            console.error("Error en .todos:", e);
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Error al obtener la información." });
        }
    }
};
