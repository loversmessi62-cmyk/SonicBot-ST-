export default {
  commands: ["n", "notify", "hidetag"],
  category: "admin",
  admin: true,

  async run(sock, msg, args, ctx) {
    try {
      const jid = msg.key.remoteJid;
      const texto = args.join(" ").trim();
      const participants = ctx.participants || [];
      const mentions = participants.map(p => p.id);

      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      // ================================
      // FUNCIÓN PARA DESCARGAR MEDIA
      // ================================
      const downloadMedia = async media => {
        const stream = await ctx.download(media);
        return stream;
      };

      // ================================
      // 1️⃣ RESPONDIENDO A UN MENSAJE
      // ================================
      if (quoted) {
        // ---- TEXTO ----
        if (quoted.conversation || quoted.extendedTextMessage?.text) {
          return await sock.sendMessage(jid, {
            text:
              texto ||
              quoted.conversation ||
              quoted.extendedTextMessage?.text,
            mentions
          });
        }

        // ---- VIEWONCE ----
        if (quoted.viewOnceMessage || quoted.viewOnceMessageV2) {
          const viewOnce =
            quoted.viewOnceMessage?.message ||
            quoted.viewOnceMessageV2?.message;

          const type = Object.keys(viewOnce)[0];
          const media = viewOnce[type];
          const buffer = await ctx.download(media);

          return await sock.sendMessage(jid, {
            [type.replace("Message", "")]: buffer,
            caption: texto || media.caption || "",
            mentions
          });
        }

        // ---- MEDIA NORMAL ----
        const mediaTypes = {
          imageMessage: "image",
          videoMessage: "video",
          stickerMessage: "sticker",
          audioMessage: "audio",
          documentMessage: "document"
        };

        for (const [key, out] of Object.entries(mediaTypes)) {
          if (quoted[key]) {
            const media = quoted[key];
            const buffer = await ctx.download(media);

            const sendObj = {
              mentions
            };

            sendObj[out] = buffer;

            if (out === "image" || out === "video") {
              sendObj.caption = texto || media.caption || "";
            }

            if (out === "audio") {
              sendObj.mimetype = media.mimetype || "audio/mpeg";
              sendObj.ptt = media.ptt || false;
            }

            if (out === "document") {
              sendObj.fileName = media.fileName || "archivo";
              sendObj.mimetype = media.mimetype;
            }

            return await sock.sendMessage(jid, sendObj);
          }
        }

        return;
      }

      // ================================
      // 2️⃣ SIN RESPONDER → TEXTO
      // ================================
      if (!texto) {
        return await sock.sendMessage(jid, {
          text: "⚠️ Escribe un texto o responde a cualquier mensaje."
        });
      }

      return await sock.sendMessage(jid, {
        text: texto,
        mentions
      });

    } catch (err) {
      console.error("❌ ERROR EN NOTIFY:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Ocurrió un error al enviar la notificación."
      });
    }
  }
};
