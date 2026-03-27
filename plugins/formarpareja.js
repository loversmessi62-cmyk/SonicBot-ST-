// memoria de parejas por grupo
const parejasUsadas = {};

const toM = (a) => '@' + a.split('@')[0];

// random seguro
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function handler(m, { conn, groupMetadata }) {
  const jid = m.chat;
  const ps = groupMetadata.participants.map(v => v.id);

  if (ps.length < 2) {
    return conn.sendMessage(jid, {
      text: '❌ Necesito al menos 2 personas para formar pareja'
    }, { quoted: m });
  }

  // inicializar memoria del grupo
  if (!parejasUsadas[jid]) parejasUsadas[jid] = [];

  let a, b, key;
  let intentos = 0;

  do {
    a = getRandom(ps);
    do {
      b = getRandom(ps);
    } while (b === a);

    // clave única (sin importar orden)
    key = [a, b].sort().join('-');
    intentos++;

    // evitar loop infinito
    if (intentos > 50) {
      parejasUsadas[jid] = [];
      break;
    }

  } while (parejasUsadas[jid].includes(key));

  // guardar pareja
  parejasUsadas[jid].push(key);

  const frases = [
    `💘 *${toM(a)} y ${toM(b)} hacen una pareja perfecta 😍*`,
    `💞 *${toM(a)} debería invitar a ${toM(b)} a salir 😏*`,
    `🔥 *Entre ${toM(a)} y ${toM(b)} hay química 🧪❤️*`,
    `🥰 *${toM(a)} y ${toM(b)} se ven bien juntos 😳*`,
    `💍 *${toM(a)} y ${toM(b)} ya deberían casarse 😍*`,
    `😏 *${toM(a)} no puede negar que le gusta ${toM(b)}*`
  ];

  const resultado = getRandom(frases);

  conn.sendMessage(jid, {
    text: `> ${resultado}\n> *¿Será el inicio de algo bonito? 😏*`,
    mentions: [a, b]
  }, { quoted: m });
}

handler.help = ['formarpareja'];
handler.tags = ['fun'];
handler.command = ['formarpareja'];
handler.group = true;

export default handler;