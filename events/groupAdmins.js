export default function groupAdmins(sock) {
  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;

      if (!["promote", "demote"].includes(action)) return;

      const texto =
        action === "promote"
          ? `👑 *Nuevo administrador*\n\n@${participants[0].split("@")[0]} ahora es admin`
          : `⚠️ *Administrador removido*\n\n@${participants[0].split("@")[0]} ya no es admin`;

      await sock.sendMessage(id, {
        text: texto,
        mentions: participants
      });

    } catch (e) {
      console.error("❌ Error alerta admin:", e);
    }
  });
}
