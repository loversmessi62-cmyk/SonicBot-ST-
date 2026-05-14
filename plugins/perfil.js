export default {
  commands: ["perfil", "profile"],
  category: "fun",

  async run(sock, msg, args, ctx) {

    const context = msg.message?.extendedTextMessage?.contextInfo || {}
    const mentioned = context.mentionedJid || []

    let user =
      mentioned[0] ||
      context.participant ||
      ctx.sender

    const tag = "@" + user.split("@")[0]

    // ===============================
    // TEXTO
    // ===============================
    const texto = `
╭━━━〔 👤 PERFIL 〕━━⬣
┃
┃ 📱 Usuario: ${tag}
┃
╰━━━━━━━━━━━━⬣
`.trim()

    // ===============================
    // FOTO PERFIL
    // ===============================
    let pp = null

    try {
      pp = await sock.profilePictureUrl(user, "image")
    } catch {
      pp = null
    }

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
        text: `⚠️ ${tag} no tiene ft de perfil\n\n${texto}`,
        mentions: [user]
      },
      { quoted: msg }
    )
  }
}