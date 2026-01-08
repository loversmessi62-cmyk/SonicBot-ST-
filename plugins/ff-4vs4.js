export default {
  command: ["4vs4"],
  run: async (sock, msg, args, ctx) => {
    const jid = ctx.jid;
    const group = ctx.groupMetadata;
    if (!group) return;

    global.match4 = global.match4 || {};
    if (!global.match4[jid]) {
      global.match4[jid] = { team: [], sub: [], lastMessage: null };
    }

    const data = global.match4[jid];

    if (args[0] === "lista") {
      return sock.sendMessage(jid, {
        text: `👥 *4vs4 Match*\n\n❤️ *Titulares:*\n${
          data.team.map(u => `❤️ @${u.split("@")[0]}`).join("\n") || "Vacío"
        }\n\n👍 *Suplentes:*\n${
          data.sub.map(u => `👍 @${u.split("@")[0]}`).join("\n") || "Vacío"
        }`,
        mentions: [...data.team, ...data.sub]
      });
    }

    const sent = await sock.sendMessage(jid, {
      text: `🎮 *4vs4 - Reacciona para unirte*\n\n❤️ = Titular (máx 4)\n👍 = Suplente\n\n⚡ Reacciona ahora`,
      mentions: []
    });

    data.lastMessage = sent.key.id;

    if (!sock.ev.listenerCount("messages.reaction")) {
      sock.ev.on("messages.reaction", async reactions => {
        try {
          const r = reactions[0];
          const user = r.participant || r.key.participant || r.key.remoteJid;
          const emoji = r.reaction?.text;
          const msgId = r.key.id;
          const num = user.split("@")[0];

          if (msgId !== data.lastMessage) return;

          const groupJids = group.participants.map(p => p.id || p.jid).filter(Boolean);
          if (!groupJids.includes(user)) return;

          if (emoji === "❤️" && data.team.length < 4) {
            if (!data.team.includes(user)) data.team.push(user);
          }

          if (emoji === "👍") {
            if (!data.sub.includes(user)) data.sub.push(user);
          }

          await sock.sendMessage(r.key.remoteJid, {
            text: `✔️ Anotado @${num}`,
            mentions: [user]
          });

        } catch (e) {
          console.error("❌ Error reaction:", e);
        }
      });
    }
  }
};