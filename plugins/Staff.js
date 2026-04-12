let handler = async (m, { conn, command, usedPrefix }) => {

let staff = `🚩 *EQUIPO OFICIAL DEL BOT*

🤖 *Bot:* ${global.botname}
🪐 *Versión:* ${global.vs}

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

✨ Gracias por formar parte de este proyecto
🚀 Seguimos trabajando para mejorar cada día
`;

await conn.sendFile(
m.chat,
'https://raw.githubusercontent.com/WillZek/Storage-CB/main/images/21396e078a24.jpg',
'staff.jpg',
staff.trim(),
fkontak,
true,
{
contextInfo: {
'forwardingScore': 200,
'isForwarded': false,
externalAdReply: {
showAdAttribution: true,
renderLargerThumbnail: true,
title: `🎩 STAFF OFICIAL`,
body: `Equipo de desarrollo`,
mediaType: 1,
sourceUrl: redes,
thumbnailUrl: icono
}}
},
{ mentions: m.sender }
);

m.react(emoji)
}

handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main', 'crow']
handler.estrellas = 1;

export default handler