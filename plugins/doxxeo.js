export default {
  commands: ["dox"],
  group: true,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    // usuario mencionado o citado
    const user =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      msg.quoted?.sender;

    if (!user) {
      return sock.sendMessage(jid, {
        text: "☠️ MENCIONA O RESPONDE A UN USUARIO ☠️"
      });
    }

    // DATOS FAKE (ROL / JODA)
    const ip = `203.0.113.${Math.floor(Math.random() * 255)}`;

    const ubicaciones = ["Sector 13", "Zona Muerta", "Distrito Negro"];
    const isp = ["DarkNet Core", "ShadowLink", "Null Provider"];
    const dispositivos = ["Android", "iPhone", "Windows"];

    const texto = `
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
`.trim();

    await sock.sendMessage(
      jid,
      {
        text: texto,
        mentions: [user]
      },
      { quoted: msg }
    );
  }
};