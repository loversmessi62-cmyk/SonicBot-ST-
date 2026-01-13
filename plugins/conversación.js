export default {
  command: ["conversacion"],
  run: async (sock, msg, args, ctx) => {
    const jid = msg.key.remoteJid;

    global.chatIA ??= {};

    // activar / desactivar
    if (args[0] === "off") {
      delete global.chatIA[jid];
      return sock.sendMessage(jid, {
        text: "🛑 Modo conversación desactivado."
      }, { quoted: msg });
    }

    // activar
    global.chatIA[jid] = {
      history: []
    };

    await sock.sendMessage(jid, {
      text: "🧠 *Modo conversación activado*\nHáblame normal, como persona a persona.\nPara salir usa:\n.conversacion off"
    }, { quoted: msg });
  },

  onMessage: async (sock, msg, ctx) => {
    const jid = msg.key.remoteJid;
    if (!global.chatIA?.[jid]) return;
    if (!msg.message?.conversation && !msg.message?.extendedTextMessage) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;
    if (text.startsWith(".")) return;

    const chat = global.chatIA[jid];

    chat.history.push({ role: "user", content: text });
    chat.history = chat.history.slice(-10); // memoria corta

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un humano sarcástico, directo, hablas como amigo. Si te insultan, puedes insultar de vuelta. Responde natural, corto y real."
            },
            ...chat.history
          ]
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;

      if (!reply) return;

      chat.history.push({ role: "assistant", content: reply });

      await sock.sendMessage(jid, {
        text: reply
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ Error IA:", e);
      await sock.sendMessage(jid, {
        text: "❌ Error hablando contigo 😔"
      });
    }
  }
};