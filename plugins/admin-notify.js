export default {
  commands: ["n", "notify", "hidetag"],
  admin: true,
  group: true,

  async run(sock, msg, args, ctx) {
    try {
      const jid = msg.key.remoteJid;
      const texto = args.join(" ").trim();

      const participants = ctx.participants || [];
      const mentions = participants.map(p => p.id);

      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      // ===============================
      // 1️⃣ RESPONDIENDO A ALGO → REENVÍO UNIVERSAL
      // ===============================
      if (quoted) {
        const fullQuoted =
          msg.message.extendedTextMessage.contextInfo;

        await sock.sendMessage(
          jid,
          {
            forward: {
              key: fullQuoted.stanzaId
                ? {
                    remoteJid: jid,
                    fromMe: false,
                    id: fullQuoted.stanzaId,
                    participant: fullQuoted.participant
                  }
                : msg.key,
              message: quoted
            },
            mentions
          }
        );

        // Texto extra después del forward (opcional)
        if (texto) {
          await sock.sendMessage(jid, {
            text: texto,
            mentions
          });
        }

        return;
      }

      // ===============================
      // 2️⃣ SIN RESPONDER → TEXTO NORMAL
      // ===============================
      if (!texto) {
        return await sock.sendMessage(jid, {
          text: "⚠️ Usa *.n <texto>* o responde a cualquier mensaje."
        });
      }

      return await sock.sendMessage(jid, {
        text: texto,
        mentions
      });

    } catch (err) {
      console.error("❌ ERROR EN HIDETAG:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error al enviar la notificación."
      });
    }
  }
};