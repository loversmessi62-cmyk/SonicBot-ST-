import fs from 'fs';
import path from 'path';

const handler = {
  command: ['totalfunciones', 'comandos', 'funciones'],
  tags: ['main'],
  help: ['totalfunciones'],
  group: false,

  async run(sock, msg, args, ctx) {
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