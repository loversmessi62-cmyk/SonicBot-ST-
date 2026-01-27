global.ComprarBot = `
🔹 VENTA DE BOTS 🔹

Automatiza tu grupo y recibe soporte 24/7

BOT PARA GRUPO: 📲 wa.me/522731590195
BOT PARA GRUPO PERMANENTE: 📲 wa.me/522731307252

⚡ Rápido • Seguro • Personalizado
`;

const handler = async (m, { conn }) => {
  if (!m.text) return;

  const text = m.text.toLowerCase().trim();

  if (text === '.comprarbot' || text === '.comprar') {
    await conn.sendMessage(
      m.chat,
      { text: global.ComprarBot },
      { quoted: m }
    );
  }
};

handler.on = 'text';

export default handler;