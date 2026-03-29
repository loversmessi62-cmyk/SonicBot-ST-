// Adaptado y ReEscrito By WillZek
import fs from "fs";
import path from "path";

const marriagesFile = path.resolve("media/database/marry.json");
const confirmation = {};

const dir = path.dirname(marriagesFile);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function loadMarriages() {
  try {
    return fs.existsSync(marriagesFile)
      ? JSON.parse(fs.readFileSync(marriagesFile, "utf8"))
      : {};
  } catch {
    return {};
  }
}

let marriages = loadMarriages();

function saveMarriages() {
  fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ""
  ).trim();
}

function getMentioned(msg) {
  const ctx =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    null;

  return {
    mentioned: ctx?.mentionedJid || [],
    participant: ctx?.participant || null
  };
}

const plugin = {
  commands: ["marry", "divorce"],
  category: "fun",
  admin: false,

  // 🔥 IMPORTANTE: compatible con tu handler
  async onMessage(sock, msg) {
    try {
      const text = getText(msg);
      if (!text) return;

      const sender = msg.key.participant || msg.key.remoteJid;
      const jid = msg.key.remoteJid;

      if (!confirmation[sender]) return;

      // ❌ rechazar
      if (/^no$/i.test(text)) {
        clearTimeout(confirmation[sender].timeout);
        delete confirmation[sender];

        return sock.sendMessage(jid, {
          text: "❌ Propuesta rechazada."
        });
      }

      // ✅ aceptar
      if (/^s[ií]$/i.test(text)) {
        const proposer = confirmation[sender].proposer;

        marriages[proposer] = sender;
        marriages[sender] = proposer;
        saveMarriages();

        clearTimeout(confirmation[sender].timeout);
        delete confirmation[sender];

        return sock.sendMessage(jid, {
          text: `💖 ¡Se han casado!\n\n@${proposer.split("@")[0]} ❤️ @${sender.split("@")[0]}`,
          mentions: [proposer, sender]
        });
      }
    } catch (e) {
      console.error("❌ Error en onMessage marry:", e);
    }
  },

  async run(sock, msg, args, ctx) {
    try {
      const sender = ctx.sender;
      const jid = ctx.jid;
      const command = ctx.command;

      const { mentioned, participant } = getMentioned(msg);
      const proposee = mentioned[0] || participant;

      const userIsMarried = user => marriages[user] !== undefined;

      // ================== MARRY ==================
      if (command === "marry") {

        if (!proposee) {
          if (userIsMarried(sender)) {
            return sock.sendMessage(jid, {
              text: `💍 Ya estás casado con @${marriages[sender].split("@")[0]}`,
              mentions: [marriages[sender]]
            });
          }

          return sock.sendMessage(jid, {
            text: "❌ Debes mencionar o responder a alguien.\nEjemplo: .marry @usuario"
          });
        }

        if (sender === proposee) {
          return sock.sendMessage(jid, {
            text: "❌ No puedes casarte contigo mismo 😹"
          });
        }

        if (userIsMarried(sender)) {
          return sock.sendMessage(jid, {
            text: "❌ Ya estás casado."
          });
        }

        if (userIsMarried(proposee)) {
          return sock.sendMessage(jid, {
            text: "❌ Esa persona ya está casada."
          });
        }

        // 🔥 evitar bug de múltiples propuestas
        if (confirmation[proposee]) {
          return sock.sendMessage(jid, {
            text: "⏳ Esa persona ya tiene una propuesta pendiente."
          });
        }

        await sock.sendMessage(jid, {
          text: `💍 @${proposee.split("@")[0]}, @${sender.split("@")[0]} te propone matrimonio 💖\n\nResponde:\n✔ Si\n❌ No`,
          mentions: [sender, proposee]
        });

        confirmation[proposee] = {
          proposer: sender,
          timeout: setTimeout(async () => {
            try {
              await sock.sendMessage(jid, {
                text: "⏰ Tiempo agotado."
              });
            } catch {}
            delete confirmation[proposee];
          }, 60000)
        };

        return;
      }

      // ================== DIVORCE ==================
      if (command === "divorce") {

        if (!userIsMarried(sender)) {
          return sock.sendMessage(jid, {
            text: "❌ No estás casado."
          });
        }

        const partner = marriages[sender];

        delete marriages[sender];
        delete marriages[partner];
        saveMarriages();

        return sock.sendMessage(jid, {
          text: `💔 @${sender.split("@")[0]} y @${partner.split("@")[0]} se divorciaron.`,
          mentions: [sender, partner]
        });
      }

    } catch (e) {
      console.error("❌ Error en marry run:", e);

      return sock.sendMessage(ctx.jid, {
        text: `❌ Error: ${e?.message || e}`
      });
    }
  }
};

export default plugin;