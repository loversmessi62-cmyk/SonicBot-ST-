import { performance } from "perf_hooks";

const handler = {
  command: ["doxear", "doxxeo", "doxeo"],
  group: true,

  async run(sock, msg, args, ctx) {
    try {
      const { jid, isGroup } = ctx;
      let who;

      // ===============================
      // DETERMINAR USUARIO OBJETIVO
      // ===============================
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

      if (isGroup) {
        if (mentioned?.length) {
          who = mentioned[0];
        } else if (msg.quoted?.sender) {
          who = msg.quoted.sender;
        } else {
          who = jid;
        }
      } else {
        who = jid;
      }

      if (!who) {
        return sock.sendMessage(
          jid,
          { text: "⚠️ Menciona a un usuario o responde a un mensaje." },
          { quoted: msg }
        );
      }

      // ===============================
      // OBTENER NOMBRE
      // ===============================
      let userName;
      try {
        userName = await sock.getName(who);
      } catch {
        userName = args.join(" ") || "Usuario desconocido";
      }

      // ===============================
      // MENSAJE INICIAL
      // ===============================
      await sock.sendMessage(
        jid,
        { text: "🧑‍💻 *Iniciando doxeo*..." },
        { quoted: msg }
      );

      // ===============================
      // CARGA SIMULADA %
      // ===============================
      for (let p = 0; p <= 100; p += Math.floor(Math.random() * 20) + 1) {
        await delay(800);
        await sock.sendMessage(
          jid,
          { text: `*${Math.min(p, 100)}%*` },
          { quoted: msg }
        );
      }

      // ===============================
      // VELOCIDAD SIMULADA
      // ===============================
      const start = performance.now();
      await delay(100);
      const end = performance.now();
      const speed = `${(end - start).toFixed(2)} ms`;

      // ===============================
      // MENSAJE FINAL
      // ===============================
      const numero = who.split("@")[0];

      const doxeo = `
👤 *Persona doxeada*

📅 ${new Date().toLocaleDateString("es-MX")}
⏰ ${new Date().toLocaleTimeString("es-MX")}
⚡ Velocidad: ${speed}

📢 Resultados:
*Nombre:* ${userName}
*Usuario:* @${numero}
*IP:* 92.28.211.234
*MAC:* 5A:78:3E:7E:00
*ISP:* Ucom Universal
*DNS:* 8.8.8.8 | 1.1.1.1
*Gateway:* 192.168.0.1
*Puertos abiertos:* UDP 8080, 80 | TCP 443
*Router:* ERICSSON | TP-LINK
`.trim();

      await sock.sendMessage(
        jid,
        {
          text: doxeo,
          mentions: [who]
        },
        { quoted: msg }
      );

    } catch (e) {
      console.error("❌ Error en doxear:", e);
      await sock.sendMessage(
        ctx.jid,
        { text: "⚠️ Ocurrió un error durante el doxeo." },
        { quoted: msg }
      );
    }
  }
};

export default handler;

// ===============================
// DELAY
// ===============================
const delay = ms => new Promise(res => setTimeout(res, ms));