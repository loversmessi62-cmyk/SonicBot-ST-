const toM = (a) => '@' + a.split('@')[0];

let handler = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, "❌ Este comando solo es para grupos.", m);
  }

  const participantes = groupMetadata.participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid);

  if (participantes.length < 2) {
    return conn.reply(m.chat, "❌ No hay suficientes participantes.", m);
  }

  // 🔄 Barra de carga
  let carga = [
    "▒▒▒▒▒▒▒▒▒▒ 0%",
    "██▒▒▒▒▒▒▒▒ 20%",
    "████▒▒▒▒▒▒ 40%",
    "██████▒▒▒▒ 60%",
    "████████▒▒ 80%",
    "██████████ 100%"
  ];

  // 📩 Enviar primer mensaje
  let msg = await conn.sendMessage(m.chat, {
    text: "🎰 Iniciando sorteo...\n\n" + carga[0]
  }, { quoted: m });

  // 🔁 Editar el mismo mensaje
  for (let i = 1; i < carga.length; i++) {
    await new Promise(r => setTimeout(r, 800));

    await conn.sendMessage(m.chat, {
      text: "🎰 Iniciando sorteo...\n\n" + carga[i],
      edit: msg.key // 🔥 aquí se edita el mismo mensaje
    });
  }

  // 🎯 Elegir ganador
  const ganador = participantes[Math.floor(Math.random() * participantes.length)];

  await new Promise(r => setTimeout(r, 500));

  // 🎉 Resultado final (edita el mismo mensaje)
  await conn.sendMessage(m.chat, {
    text: `🎉 *SORTEO FINALIZADO*\n\n👑 Ganador: ${toM(ganador)}\n\nFelicidades 🎊`,
    mentions: [ganador],
    edit: msg.key
  });
};

handler.command = ['sorteo'];
export default handler;