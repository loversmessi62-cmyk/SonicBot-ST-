let handler = async (m, { conn }) => {
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return m.reply("☠️ MENCIONA A ALGUIEN. ☠️");
  }

  let user = m.mentionedJid[0];

  // IP falsa (rango reservado)
  const ip = `203.0.113.${Math.floor(Math.random() * 255)}`;

  const ubicaciones = ["Sector 13", "Zona Muerta", "Distrito Negro"];
  const isp = ["DarkNet Core", "ShadowLink", "Null Provider"];
  const dispositivos = ["Android Rooted", "iPhone Vulnerable", "Windows Expuesto"];

  let texto = `
☠️☠️ *DOX EN PROGRESO* ☠️☠️
█▒▒▒▒▒▒▒▒▒▒ 10%
███▒▒▒▒▒▒▒▒ 35%
███████▒▒▒▒ 70%
███████████ 100%

👁️ OBJETIVO: @${user.split("@")[0]}

🌐 IP: ${ip}
📍 LOCALIZACIÓN: ${ubicaciones[Math.floor(Math.random() * ubicaciones.length)]}
📡 ISP: ${isp[Math.floor(Math.random() * isp.length)]}
📱 DISPOSITIVO: ${dispositivos[Math.floor(Math.random() * dispositivos.length)]}
🕒 LATENCIA: ${Math.floor(Math.random() * 200)} ms

⚠️ ACCESO COMPLETADO
⚠️ RASTRO DEJADO
☠️☠️☠️
`;

  await conn.sendMessage(
    m.chat,
    { text: texto, mentions: [user] },
    { quoted: m }
  );
};

handler.command = /^dox$/i;
export default handler;