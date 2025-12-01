export default {
    commands: ["hd", "enhance"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        const send = (txt) =>
            sock.sendMessage(ctx.jid, { text: txt }, { quoted: msg });

        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted)
                return send("⚠️ *Responde a una imagen o sticker para mejorarla en HD.*");

            // --- DESCARGA REAL (compatible con tu handler) ---
            let buffer;
            try {
                buffer = await ctx.download(quoted);
            } catch (e) {
                console.log("❌ Error:", e);
                return send("❌ *No se pudo descargar la imagen. Intenta con otra.*");
            }

            if (!buffer) return send("❌ *No pude obtener la imagen.*");

            await send("⏳ Mejorando imagen en HD, espera…");

            // ========= API HD =========
            const form = new FormData();
            form.append("image", buffer, "image.jpg");

            const apiKey = "f34fd260-0a46-4e06-be83-77c41d7d2e07";

            const req = await fetch("https://api.upscaler.my.id/v1/upscale", {
                method: "POST",
                headers: { "x-api-key": apiKey },
                body: form
            });

            if (!req.ok)
                return send("❌ *Error en el servidor de mejora HD.*");

            const json = await req.json();
            const imageURL = json?.data?.image;

            if (!imageURL)
                return send("⚠️ *La API no devolvió una imagen.*");

            await sock.sendMessage(ctx.jid, {
                image: { url: imageURL },
                caption: "✨ *Imagen mejorada en HD*"
            }, { quoted: msg });

        } catch (err) {
            console.error("Error en HD:", err);
            send("❌ *Ocurrió un error inesperado.*");
        }
    }
};
