const toM = (a) => '@' + a.split('@')[0];

let handler = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, "❌ Este comando solo es para grupos.", m);
  }

  const participantes = groupMetadata.participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid);

  if (participantes.length < 2) {
    return conn.reply(m.chat, "❌ No hay suficientes personas para casar.", m);
  }

  // 💑 Elegir 2 personas diferentes
  let persona1 = participantes[Math.floor(Math.random() * participantes.length)];
  let persona2;

  do {
    persona2 = participantes[Math.floor(Math.random() * participantes.length)];
  } while (persona2 === persona1);

  // 💍 Mensaje
  const texto = `💍 *BODA OFICIAL*

👰 ${toM(persona1)}
🤵 ${toM(persona2)}

💖 Desde hoy quedan casados oficialmente

¡Que viva el amor! 🎉`;

  conn.reply(m.chat, texto, m, {
    mentions: [persona1, persona2]
  });
};

handler.command = ['marry', 'casar'];
export default handler;