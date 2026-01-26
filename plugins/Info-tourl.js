import { FormData, Blob } from 'formdata-node';
import fetch from 'node-fetch';

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
      const buffer = await sock.downloadContentFromMessage(q, mime.split('/')[0]);
      
      const url = await uploadToUguu(buffer, mime);
      
      if (!url) return sock.sendMessage(jid, { text: "⚠️ No se pudo subir el archivo a la API de Uguu." }, { quoted: msg });
      
      await sock.sendMessage(jid, { text: `🔗 *Enlace generado:* ${url}` }, { quoted: msg });
    } catch (e) {
      console.error("❌ ERROR:", e);
      await sock.sendMessage(jid, { text: `❌ Error al generar el enlace: ${e.message}` }, { quoted: msg });
    }
  }
};

async function uploadToUguu(buffer, mime) {
  const form = new FormData();
  const blob = new Blob([buffer], { type: mime });
  form.append('files[]', blob, `file.${mime.split('/')[1]}`);
  
  const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form });
  
  if (!res.ok) {
    throw new Error('Failed to upload the file');
  }

  const json = await res.json();
  return json.files?.[0]?.url;
}