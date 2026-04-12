let handler = async (m, { conn }) => {

let staff = `🚩 *EQUIPO OFICIAL DEL BOT*

🤖 *Bot:* ${global.botname}
🪐 *Versión:* ${global.vs}

━━━━━━━━━━━━━━━

🎩 *Propietario*
💛 *Contacto:* wa.me/2731590195

━━━━━━━━━━━━━━━

👨‍💻 *Developers*
🍭 —
🎩 —

━━━━━━━━━━━━━━━

🛡️ *Moderadores*
🍭 —
🍭 —
🎩 —
🍭 —
🎩 —

━━━━━━━━━━━━━━━

✨ Gracias por formar parte de este proyecto
🚀 Seguimos trabajando para mejorar cada día
`;

await conn.sendMessage(m.chat, {
    image: { url: 'https://raw.githubusercontent.com/WillZek/Storage-CB/main/images/21396e078a24.jpg' },
    caption: staff
}, { quoted: m });

}
handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.tags = ['main']

export default handler