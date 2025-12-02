import axios from "axios";
import fs from "fs";

export default {
    commands: ["qc"],

    async run(sock, msg, args, ctx) {
        try {
            const text = args.join(" ");
            if (!text) return sock.sendMessage(ctx.jid, { text: "❌ Ingresa un texto\n\nEjemplo: *.qc hola*" });

            // Nombre real del usuario
            const name = msg.pushName || "Sin Nombre";

            // Foto de perfil real
            let pfp;
            try {
                pfp = await sock.profilePictureUrl(ctx.sender, "image");
            } catch {
                pfp = "https://i.ibb.co/6BRf4Rc/avatar.png";
            }

            // Body del QC CUADRADO
            const body = {
                type: "quote",
                format: "png",
                backgroundColor: "#000000",
                width: 512,
                height: 512,
                scale: 3,
                padding: 0,
                radius: 30,

                messages: [
                    {
                        avatar: true,
                        from: {
                            id: 1,
                            name: name,       // ← AQUÍ VA TU NOMBRE REAL
                            photo: { url: pfp }
                        },
                        text: text,
                        replyMessage: {}
                    }
                ]
            };

            // Petición a la API
            const { data } = await axios.post(
                "https://quotly.net/api/generate",
                body,
                { responseType: "arraybuffer" }
            );

            // Enviar como sticker
            await sock.sendMessage(ctx.jid, {
                sticker: data,
                mimetype: "image/webp"
            });

        } catch (err) {
            console.log("QC ERROR:", err);
            sock.sendMessage(ctx.jid, { text: "❌ No se pudo generar el QC." });
        }
    },
};
