import fs from 'fs';
import path from 'path';

export default {
  commands: ['rev'],
  tags: ['tools'],
  category: 'tools',

  async run(sock, msg, args, ctx) {
    const jid = ctx?.jid || msg.key?.remoteJid || msg.chat || (msg.key && msg.key.remoteJid);

    try {
      // Intentar reaccionar (si la versión de baileys lo soporta) — no es crítico si falla
      try {
        await sock.sendMessage(jid, { react: { text: '🕒', key: msg.key } });
      } catch (e) {}

      // Presencia "escribiendo"
      try {
        await sock.sendPresenceUpdate('composing', jid);
      } catch (e) {}

      const pluginsDir = './plugins';
      const files = fs.existsSync(pluginsDir)
        ? fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))
        : [];

      let response = `📂 Revisión de Syntax Errors:\n\n`;
      let hasErrors = false;

      for (const file of files) {
        try {
          // Import dinámico con file:// (igual que en tu loadPlugins)
          await import('file://' + path.resolve(pluginsDir, file));
        } catch (error) {
          hasErrors = true;
          response += `🚩 Error en: ${file}\n${error.message}\n\n`;
        }
      }

      if (!hasErrors) {
        response += '✅ ¡Todo está en orden! No se detectaron errores de sintaxis.';
      }

      await sock.sendMessage(jid, { text: response }, { quoted: msg });

      // Reacción final (opcional)
      try {
        await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });
      } catch (e) {}
    } catch (err) {
      // Reacción de fallo (opcional)
      try {
        await sock.sendMessage(jid, { react: { text: '✖️', key: msg.key } });
      } catch (e) {}

      console.error('rev plugin error:', err);
      await sock.sendMessage(jid, { text: '🚩 Ocurrió un fallo al verificar los plugins.' }, { quoted: msg });
    }
  }
};