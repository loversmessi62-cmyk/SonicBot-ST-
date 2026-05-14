export default {
  commands: ["perfil", "profile"],
  category: "fun",

  async run(sock, msg, args, ctx) {

    // ===============================
    // DETECTAR USUARIO
    // ===============================
    const context = msg.message?.extendedTextMessage?.contextInfo || {}
    const mentioned = context.mentionedJid || []

    let user

    if (mentioned.length) {
      user = mentioned[0]
    } else if (context.participant) {
      user = context.participant
    } else {
      user = ctx.sender
    }

    // ===============================
    // DATOS
    // ===============================
    const tag = "@" + user.split("@")[0]

    let name = user.split("@")[0]

    try {
      name = await sock.getName(user)
    } catch {}

    // ===============================
    // FOTO PERFIL
    // ===============================
    let pp = null

    try {
      pp = await sock.profilePictureUrl(user, 'image')
    } catch {}

    // ===============================
    // INFO RANDOM
    // ===============================
    const edades = ["16", "17", "18", "19", "20", "21"]
    const niveles = [
      "Bronce 🥉",
      "Plata 🥈",
      "Oro 🥇",
      "Heroico 🔥",
      "Maestro 💀"
    ]

    const estados = [
      "Soltero/a 😹",
      "Casado/a 💍",
      "Tóxico/a ☠️",
      "Enculado/a 😏",
      "Modo bélico 💣"
    ]

    const edad = edades[Math.floor(Math.random() * edades.length)]
    const nivel = niveles[Math.floor(Math.random() * niveles.length)]
    const estado = estados[Math.floor(Math.random() * estados.length)]

    // ===============================
    // TEXTO
    // ===============================
    const texto = `
╭━━━〔 👤 PERFIL 〕━━⬣
┃
┃ 🧑 Nombre: ${name}
┃ 📱 Usuario: ${tag}
┃ 🎂 Edad: ${edad}
┃ 🏆 Rango: ${nivel}
┃ ❤️ Estado: ${estado}
┃
╰━━━━━━━━━━━━⬣
`.trim()

    // ===============================
    // SI TIENE FOTO
    // ===============================
    if (pp) {
      return await sock.sendMessage(
        ctx.jid,
        {
          image: { url: pp },
          caption: texto,
          mentions: [user]
        },
        { quoted: msg }
      )
    }

    // ===============================
    // SI NO TIENE FOTO
    // ===============================
    await sock.sendMessage(
      ctx.jid,
      {
        text: `⚠️ @${user.split("@")[0]} no tiene ft de perfil\n\n${texto}`,
        mentions: [user]
      },
      { quoted: msg }
    )
  }
}