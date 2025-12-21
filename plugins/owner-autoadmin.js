export default {
  commands: ["autoadmin"],
  category: "owner",
  admin: true, // 👈 solo admins (y tú como owner)

  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;

    // ❌ Solo grupos
    if (!ctx.isGroup) {
      return sock.sendMessage(jid, {
        text: "❌ Este comando solo funciona en grupos."
      });
    }

    const botJid = sock.user.id.split(":")[0];

    // ✅ Ya es admin
    if (ctx.isBotAdmin) {
      return sock.sendMessage(jid, {
        text: "✅ Ya soy administrador en este grupo 😎"
      });
    }

    // ❌ El usuario no es admin
    if (!ctx.isAdmin) {
      return sock.sendMessage(jid, {
        text: "❌ Solo un administrador puede usar este comando."
      });
    }

    try {
      await sock.groupParticipantsUpdate(
        jid,
        [botJid],
        "promote"
      );

      await sock.sendMessage(jid, {
        text: "🔥 *Listo.*\nAhora soy administrador del grupo."
      });

    } catch (e) {
      console.error("❌ Error autoadmin:", e);

      await sock.sendMessage(jid, {
        text:
          "❌ No pude darme admin.\n\n" +
          "📌 *Posibles razones:*\n" +
          "• No tienes permisos suficientes\n" +
          "• El grupo no permite promociones\n" +
          "• El bot no tiene permisos aún"
      });
    }
  }
};
