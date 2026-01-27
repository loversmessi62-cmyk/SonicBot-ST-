global.ComprarBot = `
🔹 VENTA DE BOTS 🔹

Automatiza tu grupo y recibe soporte 24/7

BOT PARA GRUPO: 📲 wa.me/522731590195
BOT PARA GRUPO PERMANENTE: 📲 wa.me/522731307252

⚡ Rápido • Seguro • Personalizado
`;

const handler = async (m, { conn }) => {
  await conn.reply(m.chat, global.ComprarBot, m);
};

handler.help = ['comprarbot', 'comprar'];
handler.tags = ['info'];
handler.command = ['comprarbot', 'comprar'];

export default handler;