const parejasRecientes = []

function tag(user) {
  return '@' + user.split('@')[0]
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const delay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

export default {
  commands: ["formarpareja", "pareja"],
  category: "funny",
  group: true,

  async run(sock, msg, args, ctx) {

    try {

      // ===============================
      // OBTENER PARTICIPANTES
      // ===============================
      const metadata =
        await sock.groupMetadata(ctx.jid)

      const users = metadata.participants
        .map(p => p.id)
        .filter(v => !v.endsWith("@lid"))

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

      let user1
      let user2
      let intentos = 0

      // ===============================
      // EVITAR REPETIR PAREJAS
      // ===============================
      do {

        user1 = random(users)

        do {
          user2 = random(users)
        } while (user1 === user2)

        intentos++

        if (intentos > 20) break

      } while (
        parejasRecientes.includes(
          [user1, user2].sort().join("|")
        )
      )

      const parejaID =
        [user1, user2].sort().join("|")

      parejasRecientes.push(parejaID)

      if (parejasRecientes.length > 15) {
        parejasRecientes.shift()
      }

      // ===============================
      // FRASES DE AMOR
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
        
        `🌷 ${tag(user1)} y ${tag(user2)} combinan perfectamente 💘`,
        
        `💖 ${tag(user1)} haría cualquier cosa por ver feliz a ${tag(user2)} ✨`,
        
        `🥺 ${tag(user1)} y ${tag(user2)} se ven demasiado lindos juntos 💕`,
        
        `🌹 El destino quiere juntar a ${tag(user1)} con ${tag(user2)} 😍`,
        
        `💘 ${tag(user1)} siente algo especial por ${tag(user2)} 💞`,
        
        `✨ ${tag(user1)} y ${tag(user2)} iluminan el grupo con su amor 💖`,
        
        `💍 ${tag(user1)} y ${tag(user2)} ya deberían formalizar 😹💕`,
        
        `🌸 ${tag(user2)} se volvió la persona favorita de ${tag(user1)} 🥰`,
        
        `💞 ${tag(user1)} y ${tag(user2)} tienen una conexión muy bonita ✨`,
        
        `🥹 ${tag(user1)} y ${tag(user2)} parecen almas gemelas 💖`,
        
        `💕 Todo mundo nota la química entre ${tag(user1)} y ${tag(user2)} 😳`
      ]

      const texto =
        frases[Math.floor(Math.random() * frases.length)]

      // ===============================
      // BARRA DE CARGA
      // ===============================
      const sent = await sock.sendMessage(
        ctx.jid,
        {
          text: "💘 Buscando pareja perfecta...\n\n▒▒▒▒▒▒▒▒▒▒ 0%"
        },
        { quoted: msg }
      )

      const barras = [
        "█▒▒▒▒▒▒▒▒▒ 10%",
        "██▒▒▒▒▒▒▒▒ 20%",
        "███▒▒▒▒▒▒▒ 30%",
        "████▒▒▒▒▒▒ 40%",
        "█████▒▒▒▒▒ 50%",
        "██████▒▒▒▒ 60%",
        "███████▒▒▒ 70%",
        "████████▒▒ 80%",
        "█████████▒ 90%",
        "██████████ 100%"
      ]

      for (const barra of barras) {

        await delay(300)

        await sock.sendMessage(
          ctx.jid,
          {
            text: `💘 Buscando pareja perfecta...\n\n${barra}`,
            edit: sent.key
          }
        ).catch(() => {})
      }

      // ===============================
      // RESULTADO FINAL
      // ===============================
      await sock.sendMessage(
        ctx.jid,
        {
          text: texto,
          mentions: [user1, user2],
          edit: sent.key
        }
      ).catch(async () => {

        await sock.sendMessage(
          ctx.jid,
          {
            text: texto,
            mentions: [user1, user2]
          },
          { quoted: msg }
        )

      })

    } catch (e) {

      console.error("❌ Error en formarpareja:", e)

      await sock.sendMessage(
        ctx.jid,
        {
          text: "⚠️ Ocurrió un error formando la pareja"
        },
        { quoted: msg }
      )

    }
  }
}