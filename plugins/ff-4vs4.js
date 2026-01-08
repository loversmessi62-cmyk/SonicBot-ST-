export default {
  command: ["4vs4"],
  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;
    if (!ctx.isGroup) return;

    const participants = ctx.participants.map(p => p.id || p.jid).filter(Boolean);

    const teamPlayers = {};
    const teamSubs = {};
    const used = new Set();

    const baseList = participants.map(j => {
      const num = j.split("@")[0];
      const tag = `@${num}`;
      return tag;
    }).join("\n");

    const listMsg = await sock.sendMessage(jid, {
      text: `4vs4 🔥\n\n👥 Reacciona para entrar:\n❤️ Jugador\n👍 Suplente\n\n${baseList}`,
      mentions: participants
    });

    // Listener local al mensaje 4vs4
    sock.ev.on("messages.reaction", async (reactions) => {
      for (const r of reactions) {
        const reaction = r.reaction?.text;
        const key = r.key;
        const userJid = r.participant;

        if (key.id !== listMsg.key.id) continue;

        const userNum = userJid.split("@")[0];
        const tag = `@${userNum}`;

        if (used.has(userJid)) continue;
        used.add(userJid);

        if (reaction === "❤️") {
          teamPlayers[userJid] = tag;
        } else if (reaction === "👍") {
          teamSubs[userJid] = tag;
        }

        const playerList = Object.values(teamPlayers).join("\n") || "—";
        const subList = Object.values(teamSubs).join("\n") || "—";

        await sock.sendMessage(jid, {
          text: `4vs4 actualizado ⚡\n\n❤️ Jugadores:\n${playerList}\n\n👍 Suplentes:\n${subList}`,
          mentions: [...Object.keys(teamPlayers), ...Object.keys(teamSubs)]
        });
      }
    });
  }
};