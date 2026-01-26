import { FormData } from 'formdata-node';
import fetch from 'node-fetch';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  commands: ["tourl"],
  category: "utils",
  async run(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const q = msg.quoted || msg;
    const mime = q.mimetype || q.msg?.mimetype || '';
    
    if (!mime) return sock.sendMessage(jid, { text: "⚠️ Por favor, responde a una imagen o video con el comando *#tourl* para convertirlo en una URL." }, { quoted: msg });
    
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
      return sock.sendMessage(jid, { text: `⚠️ El formato *${mime}* no es compatible. Solo imágenes y videos MP4 son aceptados.` }, { quoted: msg });
    }
    
    try {
      const buffer = await downloadContentFromMessage(q, mime.split('/')[0]);
      const url = await uploadToOptiShield(buffer);
      
      if (!url) return sock.sendMessage(jid, { text: "⚠️ No se pudo subir el archivo a OptiShield." }, { quoted: msg });
      
      await sock.sendMessage(jid, { text: `🔗 *Enlace generado:* ${url}` }, { quoted: msg });
    } catch (e) {
      console.error("❌ ERROR:", e);
      await sock.sendMessage(jid, { text: `❌ Error al generar el enlace: ${e.message}` }, { quoted: msg });
    }
  }
};

async function uploadToOptiShield(buffer) {
  const form = new FormData();
  form.append('file', new Blob([buffer]));

  const res = await fetch('https://optishield.uk/api/upload', {
    method: 'POST',
    body: form
  });

  const json = await res.json();
  if (!json?.success || !json?.archivo) throw '❌ Error al subir a OptiShield';
  
  return json.archivo;
}