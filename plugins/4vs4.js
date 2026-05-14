let handler = async (m, { conn, args }) => {

  const textoBase =
`𝟒 𝐕𝐄𝐑𝐒𝐔𝐒 𝟒

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 :
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 :

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:

      𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1

👑 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇

ㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
🥷🏻 ┇
🥷🏻 ┇`

  // SI NO HAY ARGUMENTOS
  if (!args[0]) {
    return conn.sendMessage(m.chat, { text: textoBase }, { quoted: m })
  }

  const hora = args[0]

  const texto =
`𝟒 𝐕𝐄𝐑𝐒𝐔𝐒 𝟒

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : ${hora}
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${hora}

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:

      𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1

👑 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇

ㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
🥷🏻 ┇
🥷🏻 ┇`

  await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true
handler.admin = true

export default handler