export default {
    commands: ["todos"],
    admin: true, // Solo admins; si quieres que cualquiera lo use, pon false

    async run(sock, msg, args, ctx) {

        const { jid, groupMetadata, participants } = ctx;

        // Validación de grupo
        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        // Metadata segura
        const metadata = groupMetadata || await sock.groupMetadata(jid);
        const members = metadata.participants.map(p => p.id);

        // Día, fecha y hora
        const fecha = new Date();
        const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        const fechaCompleta = fecha.toLocaleDateString("es-ES", opciones);

        // Mensaje del usuario o uno por defecto
        const mensaje = args.length 
            ? args.join(" ")
            : "👋 *Llamo a todos los miembros del grupo.*";

        // Texto final formateado
        const texto = `
📣 *MENSAJE PARA TODOS*
📌 *Grupo:* ${metadata.subject}
👥 *Participantes:* ${members.length}
📆 *Fecha:* ${fechaCompleta}

💬 *Mensaje:*
${mensaje}
        `.trim();

        // Enviar mensaje + menciones
        await sock.sendMessage(jid, {
            text: texto,
            mentions: members
        });
    }
};
