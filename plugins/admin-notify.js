export default {
    comando: ["n", "notify"],
    descripcion: "Envía un anuncio importante para que WhatsApp lo notifique a todos",
    categoria: "admin",

    ejecutar: async (sock, m, args, { isAdmin }) => {

        if (!m.isGroup)
            return m.reply("❌ Este comando solo funciona en *grupos*.");

        if (!isAdmin)
            return m.reply("❌ Solo los *administradores* pueden usar este comando.");

        let texto = args.join(" ");
        if (!texto)
            return m.reply("📌 *Escribe el anuncio que deseas enviar*\nEjemplo:\n.n Reunión a las 8 PM.");

        await sock.sendMessage(m.chat, {
            extendedTextMessage: {
                text: `📢 *ANUNCIO IMPORTANTE*\n\n${texto}`,
                isImportant: true      // 💥 ESTO ES LO QUE NOTIFICA A TODOS
            }
        });

        return;
    }
}
