/* Código mejorado por ChatGPT + créditos a Destroy
 - https://github.com/The-King-Destroy
*/

import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/database/marry.json');
let marriages = loadMarriages();
const confirmation = {};

// 📂 Crear carpeta si no existe
const dir = path.dirname(marriagesFile);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 📥 Cargar datos
function loadMarriages() {
  try {
    return fs.existsSync(marriagesFile)
      ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8'))
      : {};
  } catch {
    return {};
  }
}

// 💾 Guardar datos
function saveMarriages() {
  fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const handler = async (m, { conn, command }) => {
  const isPropose = /^marry$/i.test(command);
  const isDivorce = /^divorce$/i.test(command);

  const userIsMarried = (user) => marriages[user] !== undefined;

  try {
    if (isPropose) {
      const proposee = m.quoted?.sender || m.mentionedJid?.[0];
      const proposer = m.sender;

      if (!proposee) {
        if (userIsMarried(proposer)) {
          return conn.reply(
            m.chat,
            `《✧》 Ya estás casado con *${await conn.getName(marriages[proposer])}*\n> Usa *#divorce* para separarte.`,
            m
          );
        }
        throw new Error('Debes mencionar a alguien.\nEjemplo: *#marry @usuario*');
      }

      if (proposer === proposee)
        throw new Error('No puedes casarte contigo mismo 😹');

      if (userIsMarried(proposer))
        throw new Error(`Ya estás casado.`);

      if (userIsMarried(proposee))
        throw new Error(`${await conn.getName(proposee)} ya está casado.`);

      const proposerName = await conn.getName(proposer);
      const proposeeName = await conn.getName(proposee);

      await conn.reply(
        m.chat,
        `💍 ${proposeeName}, ${proposerName} te propone matrimonio\n\nResponde:\n✔ *Si*\n❌ *No*`,
        m,
        { mentions: [proposee, proposer] }
      );

      confirmation[proposee] = {
        proposer,
        timeout: setTimeout(() => {
          conn.sendMessage(
            m.chat,
            { text: '⏰ Tiempo agotado. Propuesta cancelada.' },
            { quoted: m }
          );
          delete confirmation[proposee];
        }, 60000)
      };
    }

    if (isDivorce) {
      if (!userIsMarried(m.sender))
        throw new Error('No estás casado.');

      const partner = marriages[m.sender];

      delete marriages[m.sender];
      delete marriages[partner];
      saveMarriages();

      await conn.reply(
        m.chat,
        `💔 ${await conn.getName(m.sender)} y ${await conn.getName(partner)} se divorciaron.`,
        m
      );
    }
  } catch (e) {
    conn.reply(m.chat, `❌ ${e.message}`, m);
  }
};

// 📩 Respuestas (Si / No)
handler.before = async (m, { conn }) => {
  if (m.isBaileys) return;
  if (!(m.sender in confirmation)) return;
  if (!m.text) return;

  const { proposer, timeout } = confirmation[m.sender];

  // ❌ Rechazo
  if (/^no$/i.test(m.text)) {
    clearTimeout(timeout);
    delete confirmation[m.sender];

    return conn.sendMessage(
      m.chat,
      { text: '❌ Propuesta rechazada.' },
      { quoted: m }
    );
  }

  // ✔ Aceptación (soporta Si y Sí)
  if (/^s[ií]$/i.test(m.text)) {
    marriages[proposer] = m.sender;
    marriages[m.sender] = proposer;
    saveMarriages();

    clearTimeout(timeout);
    delete confirmation[m.sender];

    return conn.sendMessage(
      m.chat,
      {
        text: `💖 ¡Se han casado!\n\n👤 ${await conn.getName(proposer)}\n👤 ${await conn.getName(m.sender)}\n\n✨ Que dure para siempre`,
        mentions: [proposer, m.sender]
      },
      { quoted: m }
    );
  }
};

handler.tags = ['rg'];
handler.help = ['marry @usuario', 'divorce'];
handler.command = ['marry', 'divorce'];
handler.group = true;

export default handler;