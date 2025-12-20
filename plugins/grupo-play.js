export default {
  commands: ["play"],
  admin: false, // Si es solo para admins pon true
  async run(sock, msg, args, ctx) {
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(ctx.jid, {
        text: "❗️ Usa: *.play <nombre de la canción>*"
      });
    }

    // Mensaje inicial
    await sock.sendMessage(ctx.jid, {
      text: `🔍 Buscando: *${query}*...`
    });

    try {
      // 1) Buscar canción en MusicAPI
      const prepRes = await fetch(
        `https://bhindi1.ddns.net/music/api/prepare/${encodeURIComponent(
          query
        )}`
      );

      if (!prepRes.ok) {
        throw new Error("NO_API_RESULT");
      }

      const prepJson = await prepRes.json();
      const songId = prepJson.id;

      if (!songId) {
        return sock.sendMessage(ctx.jid, {
          text: `❌ No encontré esa canción.`
        });
      }

      // 2) Obtener datos de la canción
      const fetchRes = await fetch(
        `https://bhindi1.ddns.net/music/api/fetch/${songId}`
      );
      const songData = await fetchRes.json();

      const audioUrl =
        songData.audio_url || `https://bhindi1.ddns.net/music/api/audio/${songId}`;

      if (!audioUrl) {
        return sock.sendMessage(ctx.jid, {
          text: "❌ No pude obtener el audio."
        });
      }

      // 3) Descargar audio como buffer
      const audioBuffer = await (async () => {
        const r = await fetch(audioUrl);
        if (!r.ok) throw new Error("DOWNLOAD_FAIL");
        return Buffer.from(await r.arrayBuffer());
      })();

      // 4) Enviar audio a WhatsApp
      await sock.sendMessage(ctx.jid, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: `${songData.title || query}.mp3`
      });

    } catch (e) {
      console.error("❌ ERROR .play:", e);
      await sock.sendMessage(ctx.jid, {
        text: "❌ Ocurrió un error buscando la canción."
      });
    }
  }
};
