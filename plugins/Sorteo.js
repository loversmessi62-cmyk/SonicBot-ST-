const toM = (a) => '@' + a.split('@')[0];

let handler = async (m, { groupMetadata }) => {
  // Verificar que sea grupo
  if (!m.isGroup) {
    return m.reply("❌ Este comando solo funciona en grupos.");
  }

  // Obtener participantes
  const participantes = groupMetadata.participants
    .filter(p => !p.id.includes('bot')) // evitar bots
    .map(p => p.id);

  // Validar participantes
  if (participantes.length < 2) {
    return m.reply("❌ No hay suficientes participantes para el sorteo.");
  }

  // Elegir ganador al azar
  const ganador = participantes[Math.floor(Math.random() * participantes.length)];

  // Enviar resultado
  m.reply(
    `🎉 *SORTEO*\n\n` +
    `👑 Ganador: ${toM(ganador)}\n\n` +
    `¡Felicidades! 🎊`,
    null,
    { mentions: [ganador] }
  );
};

handler.command = ['sorteo'];
export default handler;