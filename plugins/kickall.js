import config from "../config.js"; // ⬅️ ajusta si tu ruta es distinta

export default {
  commands: ["kickall", "esby"],

  async run(sock, msg, args, ctx) {
    const {
      jid,
      isGroup,
      isBotAdmin,
      participants,
      sender
    } = ctx;

    const normalize = v =>
      v?.toString()
        .replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/\D/g, "");

    const senderNum = normalize(sender);

    // 👑 OWNER CHECK REAL (desde config)
    const owners = config.owners.map(o => normalize(o));
    if (!owners.includes(senderNum)) {
      return sock.sendMessage(jid, {
        text: "🚫 Este comando es exclusivo del *OWNER*."
      }, { quoted: msg });
    }

    if (!isGroup) {
      return sock.sendMessage(jid, {
        text: config.messages.group
      }, { quoted: msg });
    }

    if (!isBotAdmin) {
      return sock.sendMessage(jid, {
        text: "🤖❌ Necesito ser administrador para expulsar usuarios."
      }, { quoted: msg });
    }

    // 🔐 Admins del grupo (NO se expulsan)
    const adminIds = participants
      .filter(p => p.admin === "admin" || p.admin === "superadmin")
      .map(p => normalize(p.id || p.jid));

    // 🚫 Usuarios a expulsar
    const toKick = participants
      .filter(p => {
        const id = normalize(p.id || p.jid);
        return !adminIds.includes(id);
      })
      .map(p => p.id || p.jid);

    if (!toKick.length) {
      return sock.sendMessage(jid, {
        text: "⚠️ No hay usuarios para expulsar."
      }, { quoted: msg });
    }

    await sock.sendMessage(jid, {
      text: `🔥 *Kickall ejecutado por el OWNER*\n🚨 Expulsando *${toKick.length}* usuarios...`
    }, { quoted: msg });

    // ⚡ Kick en bloques (anti rate-limit)
    const CHUNK = 5;
    for (let i = 0; i < toKick.length; i += CHUNK) {
      const batch = toKick.slice(i, i + CHUNK);
      try {
        await sock.groupParticipantsUpdate(jid, batch, "remove");
      } catch (e) {
        console.error("❌ Error expulsando:", e);
      }
      await new Promise(r => setTimeout(r, 1500));
    }

    await sock.sendMessage(jid, {
      text: "✅ Limpieza total completada."
    });
  }
};