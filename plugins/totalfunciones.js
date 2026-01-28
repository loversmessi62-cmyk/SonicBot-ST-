let handler = async (m, { conn }) => {
  // Obtener plugins válidos
  let plugins = Object.values(global.plugins || {}).filter(p =>
    p &&
    p.help &&
    p.tags &&
    Array.isArray(p.help) &&
    p.help.length > 0
  );

  // Total de comandos
  let totalf = plugins.length;

  // Mensaje
  let mensaje = `✅ *TOTAL DE COMANDOS SONICBOT-ST:* ${totalf}`;

  // Enviar
  await conn.reply(m.chat, mensaje, m);
};

handler.help = ['totalfunciones'];
handler.tags = ['main'];
handler.command = ['totalfunciones', 'comandos', 'funciones'];

export default handler;