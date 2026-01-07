export default {
  commands: ["fantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      groupMetadata,
      store,
      isBotAdmin
    } = ctx;

    // ===============================
    // 🔑 NORMALIZADOR (MISMO HANDLER)
    // ===============================
    const normalizeUser = jid =>
      jid
        ?.toString()
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/\D/g, "");

    const chatStore = store.chats[jid] || {};
    const ahora = Date.now();

    // ===============================
    // 👥 MAPEAR USUARIOS
    // ===============================
    const usuarios = participants.map(p => {
      const num = normalizeUser(p.id);
      const data = chatStore[num] || null;

      return {
        id: p.id,
        num,
        admin: p.admin === "admin" || p.admin === "superadmin",
        habló: !!data,
        last: data?.time || null
      };
    });

    const fantasmas = usuarios.filter(u => !u.habló);
    const activos = usuarios.filter(u => u.habló);

    // ===============================
    // 🧪 DEBUG CONSOLA (TU IDEA)
    // ===============================
    console.log("══════════════════════════════");
    console.log("👻 FANTASMAS CHECK");
    console.log("👥 Grupo:", groupMetadata?.subject || jid);
    console.log("👤 Total:", usuarios.length);
    console.log("✅ Activos:", activos.length);
    console.log("👻 Fantasmas:", fantasmas.length);
    console.log("──────────────────────────────");

    usuarios.forEach(u => {
      console.log(`@${u.num}`);
      console.log(" ├ admin:", u.admin);
      console.log(" ├ habló:", u.habló);
      console.log(
        " └ data:",
        u.last
          ? new Date(u.last).toLocaleString("es-MX")
          : "NUNCA"
      );
    });

    console.log("══════════════════════════════");

    // ===============================
    // 🧹 KICK FANTASMAS
    // ===============================
    if (args[0] === "kick") {
      if (!isBotAdmin) {
        return sock.sendMessage(jid, {
          text: "❌ El bot no es admin, no puedo expulsar."
        });
      }

      if (args[1] !== "confirmar") {
        return sock.sendMessage(jid, {
          text:
            "⚠️ *CONFIRMACIÓN REQUERIDA*\n\n" +
            "Esto expulsará a TODOS los fantasmas.\n\n" +
            "Usa:\n.fantasmas kick confirmar"
        });
      }

      const expulsables = fantasmas.filter(u => !u.admin);

      for (const u of expulsables) {
        await sock.groupParticipantsUpdate(jid, [u.id], "remove");
      }

      return sock.sendMessage(jid, {
        text:
          `🧹 *LIMPIEZA COMPLETA*\n\n` +
          `👻 Fantasmas detectados: ${fantasmas.length}\n` +
          `🚫 Expulsados: ${expulsables.length}\n` +
          `🛡️ Admins protegidos`
      });
    }

    // ===============================
    // 📩 SOLO LISTA
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text:
          "✅ *No se detectaron fantasmas.*\n" +
          "Todos han enviado al menos un mensaje desde que el bot está en el grupo."
      });
    }

    return sock.sendMessage(jid, {
      text:
        "👻 *USUARIOS QUE NUNCA HAN HABLADO*\n" +
        "⚠️ _Desde que el bot entró al grupo_\n\n" +
        fantasmas.map(u => `👻 @${u.num}`).join("\n") +
        "\n\n🧹 Usa: *.fantasmas kick*",
      mentions: fantasmas.map(u => u.id)
    });
  }
};
