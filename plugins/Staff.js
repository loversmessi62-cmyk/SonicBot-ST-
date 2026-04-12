let handler = async (m, { conn }) => {

let staff = `🚩 *EQUIPO OFICIAL DEL BOT*

🤖 *Bot:* SonicBot-MF
🪐 *Versión:* 1.1.0

━━━━━━━━━━━━━━━

🎩 *Propietario*
💛 *Contacto:* wa.me/2731307252

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

✨ Gracias por usar *SonicBot-MF*
🚀 Seguimos mejorando para ustedes
`;

await conn.sendMessage(m.chat, {
    text: staff
}, { quoted: m });

}

handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.tags = ['main']

export default handler