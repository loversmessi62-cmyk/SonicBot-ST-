export default function groupSettings(sock) {
  sock.ev.on("groups.update", async updates => {
    try {
      for (const update of updates) {
        if (update.announce !== undefined) {
          const texto = update.announce
            ? "🔒 *El grupo fue cerrado*\nSolo administradores pueden escribir."
            : "🔓 *El grupo fue abierto*\nTodos pueden escribir.";

          await sock.sendMessage(update.id, { text: texto });
        }
      }
    } catch (e) {
      console.error("❌ Error alerta grupo:", e);
    }
  });
}
