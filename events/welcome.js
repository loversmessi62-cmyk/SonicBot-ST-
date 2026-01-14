import {
  isWelcomeEnabled,
  isByeEnabled,
  getWelcomeText,
  getByeText
} from "../utils/welcomeState.js";

const DEFAULT_WELCOME_IMG = "https://files.catbox.moe/mgqqcn.jpeg";
const DEFAULT_BYE_IMG = "https://files.catbox.moe/tozocs.jpeg";

export default function welcomeEvent(sock, groupCache) {

  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;

      // usar caché si existe
      let metadata = groupCache[id];
      if (!metadata) {
        try {
          metadata = await sock.groupMetadata(id);
          groupCache[id] = metadata;
        } catch {
          metadata = null;
        }
      }

      const groupName = metadata?.subject || "Grupo";
      const count = metadata?.participants?.length || 0;

      for (const user of participants) {
        if (user === sock.user.id) continue;

        const mention = user.split("@")[0];

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

        if (action === "add" && isWelcomeEnabled(id)) {
          const caption = getWelcomeText(id)
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, groupName)
            .replace(/@count/g, count)
            .replace(/@date/g, formattedDate)
            .replace(/@time/g, formattedTime);

          await sock.sendMessage(id, {
            image: { url: image },
            caption,
            mentions: [user]
          });
        }

        if (action === "remove" && isByeEnabled(id)) {
          const caption = getByeText(id)
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, groupName)
            .replace(/@count/g, Math.max(count - 1, 0))
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
