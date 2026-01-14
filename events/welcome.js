import {
  isWelcomeEnabled,
  isByeEnabled,
  getWelcomeText,
  getByeText
} from "../utils/welcomeState.js";

const DEFAULT_WELCOME_IMG = "https://files.catbox.moe/mgqqcn.jpeg";
const DEFAULT_BYE_IMG = "https://files.catbox.moe/tozocs.jpeg";

export default function welcomeEvent(sock, groupCache) {
  console.log("🟢 Welcome event registrado");

  sock.ev.on("group-participants.update", async (update) => {
    console.log("📥 Evento group-participants.update:", update);

    try {
      const { id, participants, action } = update;

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

        // ===== WELCOME =====
        if (action === "add" && isWelcomeEnabled(id)) {
          const raw = getWelcomeText(id) || "Bienvenido @user a @group";

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, groupName)
            .replace(/@count/g, count);

          await sock.sendMessage(id, {
            image: { url: image },
            caption,
            mentions: [user]
          });
        }

        // ===== BYE =====
        if (action === "remove" && isByeEnabled(id)) {
          const raw = getByeText(id) || "Adiós @user";

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@group/g, groupName)
            .replace(/@count/g, Math.max(count - 1, 0));

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
