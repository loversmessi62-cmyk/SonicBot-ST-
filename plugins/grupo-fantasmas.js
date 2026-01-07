export default {
  commands: ["fantasmas", "kickfantasmas"],
  admin: true,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      store,
      isBotAdmin,
      groupAdmins,
      command
    } = ctx;

    if (!store.chats[jid]) store.chats[jid] = {};
    const chat = store.chats[jid];

    // =========================
    // 🛡️ ADMINS NORMALIZADOS
    // =========================
    const adminNums = groupAdmins.map(a =>
      a.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
    );

    // =========================
    // 📋 TODOS LOS PARTICIPANTES
    // =========================
    const todos = participants.map(p => {
      const num = p.id
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "");

      return {
        id: p.id,
        num,
        isAdmin: adminNums.includes(num)
      };
    });

    const activos = [];
    const fantasmas = [];

    // =========================
    // 🔎 COMPARACIÓN REAL
    // =========================
    for (const u of todos) {
      if (u.isAdmin) continue;

      if (chat[u.num]) {
        activos.push(u);
      } else {
        fantasmas.push(u);
      }
    }

    // =========================
    // 🖥️ DEBUG TIPO ".TODOS"
    // =========================
    console.log("══════════════════════════════");
    console.log("👻 FANTASMAS CHECK");
    console.log("Grupo:", jid);
    console.log("Total:", todos.length);
    console.log("Activos:", activos.length);
    console.log("Fantasmas:", fantasmas.length);
    console.log("──────────────────────────────");

    todos.forEach(u => {
      console.log(`@${u.num}`);
      console.log(" ├ admin:", u.isAdmin);
      console.log(" ├ habló:", !!chat[u.num]);
      console.log(" └ data:", chat[u.num] || "NUNCA VISTO");
    });

    console.log("══════════════════════════════");

    // =========================
    // 👻 .fantasmas
    // =========================
    if (command === "fantasmas") {

      if (!fantasmas.length) {
        return sock.sendMessage(jid, {
          text:
            "✨ *No se detectaron fantasmas*\n\n" +
            "⚠️ Este sistema *NO es 100% exacto*.\n" +
            "Solo se basa en mensajes que el bot ha visto."
        });
      }

      let text =
        "👻 *POSIBLES FANTASMAS DEL GRUPO*\n\n" +
        "⚠️ *Aviso:* este sistema *NO es 100% exacto*.\n" +
        "Solo detecta usuarios de los que el bot *nunca ha visto mensajes*.\n\n";

      text += fantasmas.map(u => `👻 @${u.num}`).join("\n");

      text +=
        "\n\n✅ *Usuarios con actividad detectada:*\n" +
        (activos.length
          ? activos.map(u => `• @${u.num}`).join("\n")
          : "Ninguno");

      return sock.sendMessage(jid, {
        text,
        mentions: [...fantasmas, ...activos].map(u => u.id)
      });
    }

    // =========================
    // 🗑️ .kickfantasmas
    // =========================
    if (command === "kickfantasmas") {

      if (!isBotAdmin) {
        return sock.sendMessage(jid, {
          text: "❌ Necesito ser administrador para expulsar usuarios."
        });
      }

      if (!fantasmas.length) {
        return sock.sendMessage(jid, {
          text: "✨ No hay fantasmas para expulsar."
        });
      }

      const ids = fantasmas.map(u => u.id);

      await sock.sendMessage(jid, {
        text:
          "🗑️ *Expulsando usuarios que nunca enviaron mensajes*\n\n" +
          "⚠️ Esto *NO es 100% exacto*.\n\n" +
          fantasmas.map(u => `👻 @${u.num}`).join("\n"),
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
