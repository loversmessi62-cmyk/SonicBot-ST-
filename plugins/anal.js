// Código creado por Destroy wa.me/584120346669
// update x Orlando157

let handler = async (m, { conn }) => {
    let who;

    // 🔥 Detectar correctamente a quién va dirigido
    if (m.mentionedJid?.length) {
        who = m.mentionedJid[0];
    } else if (m.quoted?.sender) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    const name = await conn.getName(who);
    const name2 = await conn.getName(m.sender);

    m.react('🥵');

    // 🔥 TEXTO ORIGINAL (sin cambios)
    let str;
    if (m.mentionedJid?.length) {
        str = `\`${name2}\` le partio el culo a la puta de \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` se la metio en el ano a \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` esta haciendo un anal`;
    }

    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/7185b0be7a315706d086a.mp4',
            'https://telegra.ph/file/a11625fef11d628d3c8df.mp4',
            'https://telegra.ph/file/062b9506656e89b069618.mp4',
            'https://telegra.ph/file/1325494a54adc9a87ec56.mp4',
            'https://qu.ax/KKazS.mp4',
            'https://qu.ax/ieJeB.mp4',
            'https://qu.ax/MCdGn.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];

        await conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who] // 🔥 menciona correctamente SIEMPRE
        }, { quoted: m });
    }
};

handler.help = ['anal @tag', 'culiar @tag'];
handler.tags = ['emox'];
handler.command = ['anal','culiar'];
handler.group = true;

export default handler;