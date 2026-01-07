export default {
  commands: ["fantasmas"],
  admin: false,

  async run(sock, msg, args, ctx) {
    const {
      jid,
      participants,
      store,
      groupMetadata
    } = ctx

    if (!store.chats[jid]) store.chats[jid] = {}

    const chat = store.chats[jid]

    // ===============================
    // 🔧 NORMALIZADOR
    // ===============================
    const normalize = jid =>
      jid
        ?.replace(/@s\.whatsapp\.net|@lid/g, "")
        .replace(/:\d+/g, "")
        .replace(/[^0-9]/g, "")

    // ===============================
    // 📋 TODOS LOS USUARIOS DEL GRUPO
    // ===============================
    const users = participants.map(p => {
      const num = normalize(p.id)
      return {
        id: p.id,
        num,
        habló: !!chat[num]
      }
    })

    const activos = users.filter(u => u.habló)
    const fantasmas = users.filter(u => !u.habló)

    // ===============================
    // 🧪 LOG TIPO .TODOS (CONSOLA)
    // ===============================
    try {
      const time = new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })

      console.log("══════════════════════════════════════")
      console.log("🧪 CHECK FANTASMAS REAL")
      console.log("🕒", time)
      console.log("👥 Grupo:", groupMetadata?.subject || jid)
      console.log("👤 Total usuarios:", users.length)
      console.log("✅ Activos:", activos.length)
      console.log("👻 Fantasmas:", fantasmas.length)
      console.log("──────────────────────────────────────")

      users.forEach(u => {
        console.log(`@${u.num}`)
        console.log(" ├ habló:", u.habló)
        console.log(" └ data:", chat[u.num] || "NUNCA HABLÓ")
      })

      console.log("══════════════════════════════════════")
    } catch (e) {
      console.error("❌ Error log fantasmas:", e)
    }

    // ===============================
    // 📩 RESPUESTA EN EL GRUPO
    // ===============================
    if (!fantasmas.length) {
      return sock.sendMessage(jid, {
        text:
          "✨ *No hay fantasmas*\n\n" +
          "Todos los usuarios han enviado al menos un mensaje " +
          "desde que el bot está encendido."
      })
    }

    let text =
      "👻 *FANTASMAS DEL GRUPO*\n\n" +
      "Estos usuarios *NO han enviado ningún mensaje* desde que el bot está activo:\n\n"

    text += fantasmas.map(u => `👻 @${u.num}`).join("\n")

    text +=
      "\n\n📌 *Criterio real:*\n" +
      "• Se detecta solo actividad vista por el bot\n" +
      "• Admins incluidos\n" +
      "• Sin suposiciones\n" +
      "• 100% basado en mensajes reales"

    return sock.sendMessage(jid, {
      text,
      mentions: fantasmas.map(u => u.id)
    })
  }
}