const toM = (a) => '@' + a.split('@')[0];

let handler = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, "❌ Este comando solo es para grupos.", m);
  }

  const participantes = groupMetadata.participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid); // evita el bot

  if (participantes.length < 2) {
    return conn.reply(m.chat, "❌ No hay suficientes participantes.", m);
  }

  const ganador = participantes[Math.floor(Math.random() * participantes.length)];

  conn.reply(
    m.chat,
    `🎉 *SORTEO*\n\n👑 Ganador: ${toM(ganador)}\n\nFelicidades 🎊`,
    m,
    { mentions: [ganador] }
  );
};

handler.command = ['sorteo'];
export default handler;