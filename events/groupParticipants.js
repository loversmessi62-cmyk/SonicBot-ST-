export default function groupParticipants(sock) {
  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;

      if (!["add", "remove", "leave"].includes(action)) return;

      const map = {
        add: "👋 *Bienvenido*",
        remove: "🦶 *Usuario removido*",
        leave: "🚪 *Usuario salió*"
      };

      await sock.sendMessage(id, {
        text: `${map[action]}\n@${participants[0].split("@")[0]}`,
        mentions: participants
      });

    } catch (e) {
      console.error("❌ Error alerta participantes:", e);
    }
  });
}
