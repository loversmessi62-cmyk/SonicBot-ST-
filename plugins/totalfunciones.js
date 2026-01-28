const handler = {
  command: ['totalfunciones', 'comandos', 'funciones'],
  tags: ['main'],
  help: ['totalfunciones'],
  group: false,

  async run(sock, msg, args, ctx) {
    let plugins = [];

    // 1️⃣ Intento SonicBot-ST (más común)
    if (global.handler?.plugins) {
      plugins = Object.values(global.handler.plugins);
    }

    // 2️⃣ Intento por ctx
    else if (ctx.plugins) {
      plugins = Object.values(ctx.plugins);
    }

    // 3️⃣ Fallback
    else if (global.plugins) {
      plugins = Object.values(global.plugins);
    }

    // Filtrar solo comandos válidos
    plugins = plugins.filter(p =>
      p &&
      p.command &&
      (Array.isArray(p.command) || typeof p.command === 'string')
    );

    const total = plugins.length;

    await sock.sendMessage(
      ctx.jid,
      { text: `✅ *TOTAL DE COMANDOS SONICBOT-ST:* ${total}` },
      { quoted: msg }
    );
  }
};

export default handler;