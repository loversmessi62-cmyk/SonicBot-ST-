export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      groupMetadata,
      store,
      isBotAdmin,
      command
    } = ctx;

    const DOS_DIAS = 1000 * 60 * 60 * 24 * 2;
    const ahora = Date.now();

    const chatStore = store.chats[jid] || {};

    // ===============================
    // 📋 CONSTRUIR USUARIOS
    // ===============================
    const usuarios = participants.map(p => {
      const num = p.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "");

      const data = chatStore[num] || null;

      return {
        id: p.id,
        num,
        admin: !!p.admin,
        last: data?.time || null,
        fantasma: !data || ahora - data.time >= DOS_DIAS
      };
    });

    const fantasmas = usuarios.filter(u => u.fantasma);
    const activos = usuarios.filter(u => !u.fantasma);

    // ===============================
    // 🧪 DEBUG CONSOLA (TIPO .TODOS)
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
      console.log(" ├ habló:", !!u.last);
      console.log(
        " └ data:",
        u.last ? new Date(u.last).toLocaleString("es-MX") : "NUNCA"
      );
    });

    console.log("══════════════════════════════");

    // ===============================
    // 👻 COMANDO .fantasmas
    // ===============================
    if (command === "fantasmas") {
      if (!fantasmas.length) {
        return sock.sendMessage(jid, {
          text: "✅ *No hay fantasmas (2 días sin actividad).*"
        });
      }

      return sock.sendMessage(jid, {
        text:
          `👻 *FANTASMAS (≥ 2 días sin hablar)*\n` +
          `⚠️ _No es 100% exacto_\n\n` +
          fantasmas.map(u => `👻 @${u.num}`).join("\n") +
          `\n\n🧹 Usa:\n👉 *.kickfantasmas confirmar*`,
        mentions: fantasmas.map(u => u.id)
      });
    }

    // ===============================
    // 🗑️ COMANDO .kickfantasmas
    // ===============================
    if (command === "kickfantasmas") {
      if (!isBotAdmin) {
        return sock.sendMessage(jid, {
          text: "❌ El bot no es administrador del grupo."
        });
      }

      if (args[0] !== "confirmar") {
        return sock.sendMessage(jid, {
          text:
            "⚠️ *CONFIRMACIÓN REQUERIDA*\n\n" +
            "Esto eliminará usuarios sin actividad (≥ 2 días).\n\n" +
            "Escribe:\n👉 *.kickfantasmas confirmar*"
        });
      }

      if (!fantasmas.length) {
        return sock.sendMessage(jid, {
          text: "✨ No hay fantasmas para eliminar."
        });
      }

      const ids = fantasmas.map(u => u.id);

      await sock.sendMessage(jid, {
        text:
          "🗑️ *Eliminando fantasmas...*\n\n" +
          ids.map(x => `👻 @${x.split("@")[0]}`).join("\n"),
        mentions: ids
      });

      try {
        await sock.groupParticipantsUpdate(jid, ids, "remove");
      } catch (e) {
        console.log("❌ Error expulsando fantasmas:", e);
      }
    }
  }
};
