export default {
  command: ["4vs4"],
  run: async (sock, msg, args, ctx) => {
    const jid = ctx.jid;
    const group = ctx.groupMetadata;
    if (!group) return;

    // inicializar lista
    global.match4 = global.match4 || {};
    if (!global.match4[jid]) {
      global.match4[jid] = {
        team: [],
        sub: []
      };
    }

    const data = global.match4[jid];

    // comando para ver lista actual
    if (args[0] === "lista") {
      const team = data.team.map(u => `❤️ @${u.split("@")[0]}`).join("\n") || "Vacío";
      const sub = data.sub.map(u => `👍 @${u.split("@")[0]}`).join("\n") || "Vacío";

      return sock.sendMessage(jid, {
        text: `👥 *4vs4 Match*\n\n*Titulares:*\n${team}\n\n*Suplentes:*\n${sub}`,
        mentions: [...data.team, ...data.sub]
      });
    }

    // registrar listener 1 sola vez para reacciones
    if (!sock.ev.listenerCount("messages.reaction")) {
      sock.ev.on("messages.reaction", async reactions => {
        try {
          const r = reactions[0];
          const reactedBy = r.participant || r.key.participant || r.key.remoteJid;
          const emoji = r.reaction?.text;

          if (!reactedBy || !emoji) return;
          const userJid = reactedBy;
          const num = userJid.split("@")[0];

          const groupJids = group.participants.map(p => p.id || p.jid).filter(Boolean);

          // si el que reaccionó está en el grupo
          if (!groupJids.includes(userJid)) return;

          // agregar según emoji
          if (emoji === "❤️") {
            if (!data.team.includes(userJid) && data.team.length < 4) {
              data.team.push(userJid);
            }
          }

          if (emoji === "👍") {
            if (!data.sub.includes(userJid)) {
              data.sub.push(userJid);
            }
          }

          // mostrar confirmación con @tag
          sock.sendMessage(r.key.remoteJid, {
            text: `✔️ Anotado @${num}`,
            mentions: [userJid]
          });

        } catch (e) {
          console.error("❌ Error reaction:", e);
        }
      });
    }

    // crear mensaje para reaccionar
    const list = global.match4[jid];
    const team = list.team.map(u => `👤 @${u.split("@")[0]}`).join("\n") || "Nadie aún";

    const sent = await sock.sendMessage(jid, {
      text: `🎮 *4vs4 - Reacciona para unirte*\n\n❤️ = Titular (máx 4)\n👍 = Suplente\n\n*Actuales:*\n${team}`,
      mentions: list.team
    });

    // guardar id del mensaje para validar reacciones (opcional)
    data.lastMessage = sent.key.id;
  }
};