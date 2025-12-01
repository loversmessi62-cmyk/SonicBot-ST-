import axios from "axios";

export default {
    command: ["hd"],
    
    run: async (sock, msg, args, ctx) => {
        try {
            const buffer = await ctx.download().catch(() => null);

            if (!buffer) {
                return sock.sendMessage(ctx.jid, {
                    text: "❌ Debes responder a una imagen."
                });
            }

            await sock.sendMessage(ctx.jid, { text: "✨ Procesando imagen en HD..." });

            const apiKey = "r8_PZQQOKMhEWjVt0dHQBhycl34cPak3WI4SrjAF";

            const form = new FormData();
            form.append("image", buffer, "input.jpg");

            const { data } = await axios.post(
                "https://api.itsrose.rest/image/hd",
                form,
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        ...form.getHeaders()
                    },
                    responseType: "arraybuffer"
                }
            );

            await sock.sendMessage(ctx.jid, {
                image: data,
                caption: "🔧 Imagen mejorada con éxito."
            });

        } catch (e) {
            console.error("HD ERROR:", e);
            return sock.sendMessage(ctx.jid, {
                text: "❌ Error procesando la imagen (la API puede estar lenta)."
            });
        }
    }
};
