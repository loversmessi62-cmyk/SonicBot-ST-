export default {
    comando: ["n", "notify"],
    descripcion: "Envía un aviso a todos los miembros del grupo",
    categoria: "admin",

    ejecutar: async (sock, m, args, { isAdmin }) => {

        if (!m.isGroup)
            return m.reply("❌ Este comando solo funciona en grupos.");

        if (!isAdmin)
            return m.reply("❌ Solo los administradores pueden usar este comando.");

        let texto = args.join(" ");

        // Si no hay texto, intenta usar el mensaje citado
        if (!texto) {
            const quoted = m.quoted?.text || m.quoted?.message?.conversation;
            if (!quoted)
                return m.reply("📌 Escribe un mensaje o responde a uno.\nEjemplo:\n.n hola");
            texto = quoted;
        }

        // Obtener participantes para mencionarlos
        const metadata = await sock.groupMetadata(m.chat);
        const mentions = metadata.participants.map(p => p.id);

        await sock.sendMessage(m.chat, {
            text: `📢 *AVISO ADMIN:*\n${texto}`,
            mentions
        });

    }
};
