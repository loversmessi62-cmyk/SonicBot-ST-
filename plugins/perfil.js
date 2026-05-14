export default {
  commands: ["perfil", "profile"],
  category: "fun",

  async run(sock, msg, args, ctx) {

    const context =
      msg.message?.extendedTextMessage?.contextInfo || {}

    const mentioned = context.mentionedJid || []

    let user =
      mentioned[0] ||
      context.participant ||
      ctx.sender

    const tag = "@" + user.split("@")[0]

    const texto = `
╭━━━〔 👤 PERFIL 〕━━⬣
┃
┃ 📱 Usuario: ${tag}
┃
╰━━━━━━━━━━━━⬣
`.trim()

    // ⚡ MÁS RÁPIDO
    let pp

    try {
      pp = await sock.profilePictureUrl(user, "image")
    } catch {
      pp = "https://i.imgur.com/JP5q8Gx.jpeg"
    }

    // ✅ SOLO ENVÍA 1 MENSAJE
    await sock.sendMessage(
      ctx.jid,
      {
        image: { url: pp },
        caption:
          pp.includes("imgur")
            ? `⚠️ ${tag} no tiene ft de perfil\n\n${texto}`
            : texto,
        mentions: [user]
      },
      { quoted: msg }
    )
  }
}