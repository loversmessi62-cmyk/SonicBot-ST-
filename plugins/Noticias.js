export default {
    commands: ["noticias"],
    category: "info",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        const texto = `📢 *COMUNICADO OFICIAL*

Hola usuarios 👋

Actualmente el comando *.del* se encuentra temporalmente fuera de servicio ⚙️, nuestro equipo ya está trabajando para solucionarlo lo antes posible.

🚫 Así mismo, los comandos *+18* han sido deshabilitados temporalmente hasta nuevo aviso.

Agradecemos su paciencia y comprensión 🙏
Estén atentos a próximas actualizaciones 🚀`;

        await sock.sendMessage(jid, {
            text: texto
        }, { quoted: msg });
    }
};