const handler = {
  command: ['totalfunciones', 'comandos', 'funciones'],
  tags: ['main'],
  help: ['totalfunciones'],
  group: false,

  async run(sock, msg, args, ctx) {
    let plugins = [];

    try {
      plugins = Object.values(global.plugins ?? {}).filter(p =>
        p &&
        p.help &&
        Array.isArray(p.help) &&
        p.help.length > 0
      );
    } catch {}

    const total = plugins.length;

    await sock.sendMessage(
      ctx.jid,
      { text: `✅ *TOTAL DE COMANDOS SONICBOT-ST:* ${total}` },
      { quoted: msg }
    );
  }
};

export default handler;