reacciones handler

// =====================================================
// ❤️ PUENTE GLOBAL DE REACCIONES → PLUGINS
// =====================================================
sock.ev.on("messages.reaction", async (reactions) => {
  try {
    const r = reactions[0];
    if (!r) return;

    const jid = r.key.remoteJid;
    const user = r.participant || r.key.participant;
    if (!user || user === sock.user.id) return;

    const num = user.split("@")[0];
    const lid = user;
    const id = user;
    const jidGroup = jid;

    // Buscar coincidencia en el grupo
    const metadata = await sock.groupMetadata(jid);
    const miembro = metadata.participants.find(p => {
      const n = p.id.split("@")[0];
      return n === num || p.id === id || p.id === lid;
    });

    if (!miembro) {
      console.log("❌ Reacción no coincide con un miembro del grupo");
      return;
    }

    // Enviar a todos los plugins que tengan onReaction
    for (let cmd in plugins) {
      const plug = plugins[cmd];
      if (plug.onReaction) {
        await plug.onReaction(sock, reactions, {
          id,
          lid,
          jid: miembro.id,
          num,
          jidGroup
        });
      }
    }
  } catch (e) {
    console.error("❌ Error en puente de reacciones:", e);
  }
});