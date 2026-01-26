import config from "../config.js"; // ajusta la ruta si es distinta

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

    // 👑 OWNER CHECK (desde config)
    const senderNum = normalize(sender);
    const owners = config.owners.map(o => normalize(o));

    if (!owners.includes(senderNum)) {
      return sock.sendMessage(
        jid,
        { text: "🚫 Este comando es exclusivo del *OWNER*." },
        { quoted: msg }
      );
    }

    if (!isGroup) {
      return sock.sendMessage(
        jid,
        { text: config.messages.group },
        { quoted: msg }
      );
    }

    if (!isBotAdmin) {
      return sock.sendMessage(
        jid,
        { text: "🤖❌ Necesito ser administrador para expulsar usuarios." },
        { quoted: msg }
      );
    }

    // 🔥 FIX REAL: solo NO admins
    const toKick = participants
      .filter(p => !p.admin) // 👈 CLAVE
      .map(p => p.id || p.jid);

    if (!toKick.length) {
      return sock.sendMessage(
        jid,
        { text: "⚠️ No hay usuarios para expulsar." },
        { quoted: msg }
      );
    }

    await sock.sendMessage(
      jid,
      {
        text: `🔥 *Kickall ejecutado por el OWNER*\n🚨 Expulsando *${toKick.length}* usuarios...`
      },
      { quoted: msg }
    );

    // ⚡ Anti crash / anti rate-limit
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