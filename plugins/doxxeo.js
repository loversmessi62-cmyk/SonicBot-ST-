let handler = async (m, { conn }) => {
  let user =
    m.mentionedJid?.[0] ||
    m.quoted?.sender;

  if (!user) {
    return m.reply("☠️ MENCIONA O RESPONDE A UN USUARIO ☠️");
  }

  const ip = `203.0.113.${Math.floor(Math.random() * 255)}`;

  const ubicaciones = ["Sector 13", "Zona Muerta", "Distrito Negro"];
  const isp = ["DarkNet Core", "ShadowLink", "Null Provider"];
  const dispositivos = ["Android", "iPhone", "Windows"];

  let texto = `
☠️ DOX EN PROGRESO ☠️

⏳ Iniciando rastreo...
⏳ Analizando red...
⏳ Extrayendo datos...
✅ Proceso completado

👁 OBJETIVO: @${user.split("@")[0]}

🌐 IP: ${ip}
📍 Ubicación: ${ubicaciones[Math.floor(Math.random() * ubicaciones.length)]}
📡 ISP: ${isp[Math.floor(Math.random() * isp.length)]}
📱 Dispositivo: ${dispositivos[Math.floor(Math.random() * dispositivos.length)]}
🕒 Latencia: ${Math.floor(Math.random() * 200)} ms

⚠️ ACCESO CONCEDIDO
☠️☠️☠️
`;

  await conn.sendMessage(
    m.chat,
    { text: texto, mentions: [user] },
    { quoted: m }
  );
};

handler.command = /^dox$/i;
handler.group = true;
export default handler;