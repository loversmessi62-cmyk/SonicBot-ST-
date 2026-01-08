import fs from "fs";

const reactionList = {}; // { groupJid: [tags...] }
const matchPlayers = {}; // { groupJid: { id, lid, jid, num } }

export default {
  name: "4vs4",
  once: true,
  execute(sock) {

    // 👇 Comando para iniciar 4vs4
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const text = msg.message.conversation || "";
      const group = msg.key.remoteJid;

      if (text.startsWith("!4vs4")) {
        const parts = text.split(" ");
        if (parts.length < 5) {
          return sock.sendMessage(group, { text: "Uso: !4vs4 id lid jid num" });
        }

        const [_, id, lid, jid, num] = parts;

        matchPlayers[group] = { id, lid, jid, num };
        reactionList[group] = [];

        await sock.sendMessage(group, {
          text: `🔥 *4VS4 INICIADO*\nJugadores a detectar:\n• id: ${id}\n• lid: ${lid}\n• jid: ${jid}\n• num: ${num}`
        });

        console.log("⚔ 4vs4 creado en:", group, matchPlayers[group]);
      }
    });

    // 👇 Listener de reacciones para anotar jugadores
    if (!sock.ev.listenerCount("messages.reaction")) {
      sock.ev.on("messages.reaction", async (reactions) => {
        const r = reactions[0];
        if (!r) return;

        const user = r.participant || r.key.participant;
        const group = r.key.remoteJid;

        if (!matchPlayers[group]) return; // si no hay partida, ignora
        if (user === sock.user.id) return; // ignora reacciones del bot

        const tag = "@" + user.split("@")[0];

        const { id, lid, jid, num } = matchPlayers[group];

        // 👇 Si coincide con alguno de los 4 valores
        if (
          user.includes(id) ||
          user.includes(lid) ||
          user.includes(jid) ||
          user.includes(num)
        ) {
          reactionList[group].push(tag);

          await sock.sendMessage(group, {
            text: `🎯 *Jugador detectado:* ${tag}\n📋 *Lista actual:* ${reactionList[group].join(", ")}`,
            mentions: [user]
          });

          console.log("✔ Coincidencia 4vs4:", user, matchPlayers[group]);
        }
      });
    }

    // 👇 Limpieza automática cada 5 o 10 minutos
    setInterval(() => {
      console.log("🧽 Limpieza automática 4vs4 (reacciones y lista)...");

      for (const g in reactionList) {
        reactionList[g] = [];
      }

      for (const g in matchPlayers) {
        delete matchPlayers[g];
      }

      if (global.messageLog) global.messageLog = {};
      if (global.match4) global.match4 = {};

      console.log("✅ Limpieza 4vs4 completada, listas vacías y partidas borradas.");
    }, 10 * 60 * 1000); // 10 minutos (puedes cambiar a 5 si quieres)

  }
};