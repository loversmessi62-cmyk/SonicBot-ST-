const handler = {
  command: ['totalfunciones', 'comandos', 'funciones'],
  tags: ['main'],
  help: ['totalfunciones'],
  group: false,

  async run(sock, msg, args, ctx) {
    let total = 0;

    // 🔥 SonicBot-ST usa Map para los comandos
    if (global.commands instanceof Map) {
      total = global.commands.size;
    }

    // fallback por si cambia el core
    else if (typeof global.commands === 'object') {
      total = Object.keys(global.commands).length;
    }

    await sock.sendMessage(
      ctx.jid,
      { text: `✅ *TOTAL DE COMANDOS SONICBOT-ST:* ${total}` },
      { quoted: msg }
    );
  }
};

export default handler;