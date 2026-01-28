// Créditos originales: Destroy wa.me/584120346669

const handler = {
  command: ["kiss2", "besar2"],
  group: true,

  async run(sock, msg, args, ctx) {
    try {
      const { jid, isGroup } = ctx;
      let who;

      // ===============================
      // DETERMINAR USUARIO
      // ===============================
      const mentioned =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

      if (mentioned?.length) {
        who = mentioned[0];
      } else if (msg.quoted?.sender) {
        who = msg.quoted.sender;
      } else {
        who = ctx.sender;
      }

      // ===============================
      // OBTENER NOMBRES
      // ===============================
      let name, name2;
      try {
        name = await sock.getName(who);
      } catch {
        name = who.split("@")[0];
      }

      try {
        name2 = await sock.getName(ctx.sender);
      } catch {
        name2 = ctx.sender.split("@")[0];
      }

      // ===============================
      // TEXTO
      // ===============================
      let text;
      if (mentioned?.length) {
        text = `\`${name2}\` besó excitantemente a \`${name}\`.`;
      } else if (msg.quoted) {
        text = `\`${name2}\` besó apasionadamente a \`${name}\`.`;
      } else {
        text = `\`${name2}\` se besa a sí mismo 😏`;
      }

      if (!isGroup) return;

      // ===============================
      // VIDEOS
      // ===============================
      const videos = [
        "https://qu.ax/bLLe.mp4","https://qu.ax/mwXW.mp4","https://qu.ax/WUiG.mp4",
        "https://qu.ax/djk.mp4","https://qu.ax/xdis.mp4","https://qu.ax/JKEw.mp4",
        "https://qu.ax/eCmG.mp4","https://qu.ax/Rtaw.mp4","https://qu.ax/Esky.mp4",
        "https://qu.ax/AYoP.mp4","https://qu.ax/ulK.mp4","https://qu.ax/xgVd.mp4",
        "https://qu.ax/gchC.mp4","https://qu.ax/DSbr.mp4","https://qu.ax/duCR.mp4",
        "https://qu.ax/aHmt.mp4","https://qu.ax/BmUb.mp4","https://qu.ax/lBqZ.mp4",
        "https://qu.ax/LcxW.mp4","https://qu.ax/MacM.mp4","https://qu.ax/vwbX.mp4",
        "https://qu.ax/hnzN.mp4","https://qu.ax/hqZa.mp4","https://qu.ax/WUE.mp4"
      ];

      const video = videos[Math.floor(Math.random() * videos.length)];

      // ===============================
      // ENVIAR MENSAJE
      // ===============================
      await sock.sendMessage(
        jid,
        {
          video: { url: video },
          gifPlayback: true,
          caption: text,
          mentions: [who]
        },
        { quoted: msg }
      );

    } catch (e) {
      console.error("❌ Error en kiss2:", e);
      await sock.sendMessage(
        ctx.jid,
        { text: "⚠️ Ocurrió un error." },
        { quoted: msg }
      );
    }
  }
};

export default handler;