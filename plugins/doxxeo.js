import { performance } from "perf_hooks";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default {
  commands: ["dox", "doxxeo", "doxeo"],
  category: "fun",
  group: true,

  async run(sock, msg, args, ctx) {

    try {

      // ===============================
      // DETECTAR USUARIO
      // ===============================
      const context =
        msg.message?.extendedTextMessage?.contextInfo || {}

      const mentioned = context.mentionedJid || []

      let who

      if (mentioned.length) {
        who = mentioned[0]
      } else if (context.participant) {
        who = context.participant
      } else {
        return await sock.sendMessage(
          ctx.jid,
          {
            text: "⚠️ Menciona o responde a alguien"
          },
          { quoted: msg }
        )
      }

      const numero = who.split("@")[0]

      // ===============================
      // MENSAJE INICIAL
      // ===============================
      const sent = await sock.sendMessage(
        ctx.jid,
        {
          text: "🧑‍💻 Iniciando doxeo...\n\n▒▒▒▒▒▒▒▒▒▒ 0%"
        },
        { quoted: msg }
      )

      // ===============================
      // BARRA
      // ===============================
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

        await delay(400)

        await sock.sendMessage(
          ctx.jid,
          {
            text: `🧑‍💻 Iniciando doxeo...\n\n${barra}`,
            edit: sent.key
          }
        ).catch(() => {})
      }

      // ===============================
      // VELOCIDAD
      // ===============================
      const start = performance.now()

      await delay(100)

      const end = performance.now()

      const speed =
        `${(end - start).toFixed(2)} ms`

      // ===============================
      // DATOS RANDOM
      // ===============================
      const ips = [
        "92.28.211.234",
        "181.177.92.11",
        "201.109.33.87",
        "45.83.211.99"
      ]

      const routers = [
        "TP-LINK",
        "Huawei",
        "Mikrotik",
        "ERICSSON"
      ]

      const dns = [
        "8.8.8.8",
        "1.1.1.1",
        "208.67.222.222"
      ]

      const ip =
        ips[Math.floor(Math.random() * ips.length)]

      const router =
        routers[Math.floor(Math.random() * routers.length)]

      const dnsRandom =
        dns[Math.floor(Math.random() * dns.length)]

      // ===============================
      // RESULTADO
      // ===============================
      const resultado = `
🧑‍💻 *DOXEO COMPLETADO*

📅 ${new Date().toLocaleDateString("es-MX")}
⏰ ${new Date().toLocaleTimeString("es-MX")}

👤 Usuario: @${numero}

🌐 IP: ${ip}
📡 DNS: ${dnsRandom}
⚡ Ping: ${speed}
🔓 Puerto: 443
📶 ISP: Telmex
🛜 Router: ${router}
💻 Sistema: Android 14
📍 Ubicación: México

⚠️ Datos filtrados correctamente
`.trim()

      // ===============================
      // MENSAJE FINAL
      // ===============================
      await sock.sendMessage(
        ctx.jid,
        {
          text: resultado,
          mentions: [who],
          edit: sent.key
        }
      ).catch(async () => {

        await sock.sendMessage(
          ctx.jid,
          {
            text: resultado,
            mentions: [who]
          },
          { quoted: msg }
        )

      })

    } catch (e) {

      console.error("❌ Error en doxear:", e)

      await sock.sendMessage(
        ctx.jid,
        {
          text: "⚠️ Ocurrió un error durante el doxeo"
        },
        { quoted: msg }
      )

    }
  }
}