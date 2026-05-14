let handler = async (m, { conn, args }) => {

  // ===============================
  // SI NO PONE HORA
  // ===============================
  if (!args[0]) {
    return conn.reply(
      m.chat,
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
🥷🏻 ┇`,
      m
    )
  }

  // ===============================
  // HORA
  // ===============================
  const horaMX = args[0]

  // ===============================
  // MENSAJE
  // ===============================
  const texto =
`𝟒 𝐕𝐄𝐑𝐒𝐔𝐒 𝟒

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : ${horaMX}
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 : ${horaMX}

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

  // ===============================
  // ENVIAR
  // ===============================
  await conn.reply(m.chat, texto, m)
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true
handler.admin = true

export default handler