import { Blob } from "buffer";

export default {
    commands: ["hd", "enhance"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        const send = (t) =>
            sock.sendMessage(ctx.jid, { text: t }, { quoted: msg });

        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted)
                return send("⚠️ *Responde a una imagen para mejorarla en HD.*");

            // ------------------------------------------
            // DESCARGA REAL→ funciona con tu handler
            // ------------------------------------------
            let buffer;
            try {
                buffer = await ctx.download();
            } catch (e) {
                console.log("❌ error:", e);
                return send("❌ *No pude leer la imagen.*");
            }

            if (!buffer) return send("❌ *Imagen inválida.*");

            await send("⏳ Mejorando imagen en HD…");

            // ------------------------------------------
            // FIX: undici → convertir buffer a Blob
            // ------------------------------------------
            const blob = new Blob([buffer], { type: "image/jpeg" });
            const form = new FormData();
            form.append("image", blob, "image.jpg");

            // API KEY tuya
            const apiKey = "f34fd260-0a46-4e06-be83-77c41d7d2e07";

            const req = await fetch("https://api.upscaler.my.id/v1/upscale", {
                method: "POST",
                headers: { "x-api-key": apiKey },
                body: form,
            });

            if (!req.ok) return send("❌ *Error en el servidor HD.*");

            const json = await req.json();
            const imageUrl = json?.data?.image;

            if (!imageUrl)
                return send("❌ *La API no devolvió imagen.*");

            // ENVIAR FOTO HD
            await sock.sendMessage(
                ctx.jid,
                {
                    image: { url: imageUrl },
                    caption: "✨ *Imagen mejorada en HD*",
                },
                { quoted: msg }
            );

        } catch (err) {
            console.error("Error en HD:", err);
            send("❌ *Error inesperado.*");
        }
    },
};
