function tag(user) {
  return '@' + user.split('@')[0]
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default {
  commands: ["formarpareja", "pareja"],
  category: "funny",
  group: true,

  async run(sock, msg, args, ctx) {

    try {

      // ===============================
      // PARTICIPANTES
      // ===============================
      const metadata =
        await sock.groupMetadata(ctx.jid)

      const users = metadata.participants
        .map(p => p.id)

      // ===============================
      // VALIDAR
      // ===============================
      if (users.length < 2) {
        return await sock.sendMessage(
          ctx.jid,
          {
            text: "⚠️ Se necesitan mínimo 2 personas"
          },
          { quoted: msg }
        )
      }

      // ===============================
      // ELEGIR PAREJA
      // ===============================
      let user1 = random(users)
      let user2

      do {
        user2 = random(users)
      } while (user1 === user2)

      // ===============================
      // FRASES
      // ===============================
      const frases = [
        `💖 ${tag(user1)} y ${tag(user2)} hacen una pareja hermosa 🥺`,
        `🌹 ${tag(user1)} encontró felicidad al lado de ${tag(user2)} ✨`,
        `💘 ${tag(user1)} y ${tag(user2)} parecen hechos el uno para el otro 💕`,
        `🥰 Cuando ${tag(user1)} habla con ${tag(user2)}, todo se vuelve más bonito 💞`,
        `💍 ${tag(user1)} y ${tag(user2)} ya parecen una pareja de película 😍`,
        `🌸 ${tag(user1)} sonríe diferente desde que conoció a ${tag(user2)} 💖`,
        `💕 ${tag(user1)} y ${tag(user2)} transmiten mucho amor juntos ✨`,
        `🫶 ${tag(user1)} y ${tag(user2)} serían una relación muy tierna 🥺`,
        `💞 Entre ${tag(user1)} y ${tag(user2)} hay sentimientos reales 😳`,
        `🌷 ${tag(user1)} y ${tag(user2)} combinan perfectamente 💘`
      ]

      const texto =
        frases[Math.floor(Math.random() * frases.length)]

      // ===============================
      // ENVIAR
      // ===============================
      await sock.sendMessage(
        ctx.jid,
        {
          text: texto,
          mentions: [user1, user2]
        },
        { quoted: msg }
      )

    } catch (e) {

      console.error("❌ Error en formarpareja:", e)

      await sock.sendMessage(
        ctx.jid,
        {
          text: "⚠️ Error al formar pareja"
        },
        { quoted: msg }
      )

    }
  }
}