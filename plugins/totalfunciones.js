import fs from 'fs';
import path from 'path';

// 🔒 Set global para evitar duplicados
global._totalfuncionesHandled ??= new Set();

const handler = {
  command: ['totalfunciones', 'comandos', 'funciones'],
  tags: ['main'],
  help: ['totalfunciones'],
  group: false,

  async run(sock, msg, args, ctx) {
    const msgId = msg.key?.id;

    // 🛑 BLOQUEO DEFINITIVO
    if (msgId && global._totalfuncionesHandled.has(msgId)) return;
    if (msgId) global._totalfuncionesHandled.add(msgId);

    try {
      const pluginsDir = path.join(process.cwd(), 'plugins');
      const files = fs.readdirSync(pluginsDir)
        .filter(file => file.endsWith('.js'));

      const total = files.length;

      await sock.sendMessage(
        ctx.jid,
        { text: `✅ *TOTAL DE COMANDOS SONICBOT-ST:* ${total}` },
        { quoted: msg }
      );

    } catch (e) {
      await sock.sendMessage(
        ctx.jid,
        { text: '❌ No se pudo leer la carpeta plugins.' },
        { quoted: msg }
      );
    }
  }
};

export default handler;