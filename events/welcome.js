import {
  isWelcomeEnabled,
  isByeEnabled,
  getWelcomeText,
  getByeText
} from "../utils/welcomeState.js";

export default function welcomeEvent(sock, groupCache) {

  const DEFAULT_WELCOME_IMG = "https://files.catbox.moe/mgqqcn.jpeg";
  const DEFAULT_BYE_IMG = "https://files.catbox.moe/tozocs.jpeg";

  console.log("👋 Welcome event registrado");

  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;

      // 🔁 metadata segura (cache + fallback)
      let metadata = groupCache[id];
      if (!metadata) {
        metadata = await sock.groupMetadata(id);
        groupCache[id] = metadata;
      }

      for (const user of participants) {
        if (user === sock.user.id) continue;

        const mention = user.split("@")[0];
        const count = metadata.participants.length;

        let image;
        try {
          image = await sock.profilePictureUrl(user, "image");
        } catch {
          image = action === "add"
            ? DEFAULT_WELCOME_IMG
            : DEFAULT_BYE_IMG;
        }

        const date = new Date();
        const formattedDate = date.toLocaleDateString("es-MX");
        const formattedTime = date.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit"
        });

        // ===== WELCOME =====
        if (action === "add" && isWelcomeEnabled(id)) {

          const raw = getWelcomeText(id);

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@id/g, mention)
            .replace(
              /@name/g,
              metadata.participants.find(p => p.id === user)?.notify || "Usuario"
            )
            .replace(/@group/g, metadata.subject || "Grupo")
            .replace(/@desc/g, metadata.desc || "Sin descripción")
            .replace(/@count/g, count)
            .replace(/@date/g, formattedDate)
            .replace(/@time/g, formattedTime);

          await sock.sendMessage(id, {
            image: { url: image },
            caption,
            mentions: [user]
          });
        }

        // ===== BYE =====
        if (action === "remove" && isByeEnabled(id)) {

          const raw = getByeText(id);

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@id/g, mention)
            .replace(
              /@name/g,
              metadata.participants.find(p => p.id === user)?.notify || "Usuario"
            )
            .replace(/@group/g, metadata.subject || "Grupo")
            .replace(/@desc/g, metadata.desc || "Sin descripción")
            .replace(/@count/g, count - 1)
            .replace(/@date/g, formattedDate)
            .replace(/@time/g, formattedTime);

          await sock.sendMessage(id, {
            image: { url: image },
            caption,
            mentions: [user]
          });
        }
      }

    } catch (e) {
      console.error("❌ Error welcome/bye:", e);
    }
  });
}
