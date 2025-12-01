export default {
    commands: ["hd", "enhance"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        try {
            const jid = ctx.jid;

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted)
                return ctx.reply("⚠️ *Responde a una imagen o sticker para mejorarla en HD.*");

            // --- DESCARGAR MEDIA (usa tu handler real) ---
            let buffer;
            try {
                buffer = await ctx.download(quoted);
            } catch (err) {
                console.log("⛔ Error en descarga:", err);
                return ctx.reply("❌ *No se pudo descargar la imagen.* Intenta con otra.");
            }

            if (!buffer)
                return ctx.reply("❌ *No se pudo obtener el archivo.*");

            ctx.reply("⏳ Procesando imagen en HD, espera…");

            // ========= API REALES DE UPSCALE =========
            const form = new FormData();
            form.append("image", buffer, "image.jpg");

            const apiKey = "f34fd260-0a46-4e06-be83-77c41d7d2e07";

            const req = await fetch("https://api.upscaler.my.id/v1/upscale", {
                method: "POST",
                headers: { "x-api-key": apiKey },
                body: form
            });

            if (!req.ok) return ctx.reply("❌ Error en el servidor de mejora HD.");

            const json = await req.json();
            const resultUrl = json?.data?.image;

            if (!resultUrl)
                return ctx.reply("⚠️ *No se pudo obtener la imagen mejorada.*");

            // ENVIAR IMAGEN RESULTANTE
            await sock.sendMessage(jid, {
                image: { url: resultUrl },
                caption: "✨ *Imagen mejorada en HD*"
            });

        } catch (err) {
            console.error("Error en .hd:", err);
            ctx.reply("❌ *Hubo un error al mejorar la imagen.*");
        }
    }
};
