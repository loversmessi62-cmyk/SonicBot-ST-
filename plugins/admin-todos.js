export default {
    commands: ["todos", "invocar"],
    admin: true, // Solo admin
    category: "administración",

    async run(sock, msg, args, ctx) {
        try {
            const jid = ctx.jid || msg.key.remoteJid;

            if (!ctx.isGroup) {
                return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
            }

            // Obtener metadata de forma segura
            const metadata = ctx.groupMetadata || await sock.groupMetadata(jid);
            if (!metadata || !Array.isArray(metadata.participants)) {
                return sock.sendMessage(jid, { text: "❌ No pude obtener la lista de participantes del grupo." });
            }

            const nombreGrupo = metadata.subject || "Grupo";
            const participantes = metadata.participants.map(p => p.id); // ["1234@s.whatsapp.net", ...]
            const total = participantes.length;

            // Fecha bonita
            const fecha = new Date();
            const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
            const meses = [
                "Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
            ];
            const fechaBonita = `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;

            // Texto principal
            const mensaje = args.join(" ").trim() || "Mensaje del admin:";
            // Lista de tags en líneas separadas: @tag\n@tag\n...
            const listaTags = participantes.map(id => "@" + id.split("@")[0]).join("\n");

            const texto =
`📢 *MENSAJE PARA TODOS LOS MIEMBROS*

👥 *Grupo:* ${nombreGrupo}
📌 *Participantes (total):* ${total}
📅 *Día:* ${fechaBonita}

💬 *Mensaje del admin:*
${mensaje}

🔖 *Menciones:*
${listaTags}
`;

            // Enviar con menciones reales (soporta notificaciones)
            await sock.sendMessage(jid, {
                text: texto,
                mentions: participantes
            });

        } catch (err) {
            console.error("Error en admin-todos:", err);
            await sock.sendMessage(ctx.jid || msg.key.remoteJid, { text: "❌ Hubo un error ejecutando este comando." });
        }
    }
};
