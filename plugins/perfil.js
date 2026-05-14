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
    let pp

    try {
      pp = await Promise.race([
        sock.profilePictureUrl(user, "image"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000)
        )
      ])
    } catch {
      pp = null
    }

    // ===============================
    // ENVIAR
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