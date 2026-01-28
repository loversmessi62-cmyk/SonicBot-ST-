let handler = async (m, { conn }) => {
  let plugins = [];

  try {
    plugins = Object.values(global.plugins ?? {}).filter(p =>
      p &&
      Array.isArray(p.help) &&
      p.help.length > 0
    );
  } catch (e) {
    plugins = [];
  }

  let totalf = plugins.length;

  let mensaje = `✅ *TOTAL DE COMANDOS SONICBOT-ST:* ${totalf}`;

  await conn.reply(m.chat, mensaje, m);
};

handler.help = ['totalfunciones'];
handler.tags = ['main'];
handler.command = ['totalfunciones', 'comandos', 'funciones'];

export default handler;