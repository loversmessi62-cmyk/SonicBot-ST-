// =====================
// WELCOME / BYE (STABLE)
// =====================

import {
  isWelcomeEnabled,
  isByeEnabled,
  getWelcomeText,
  getByeText
} from "../utils/welcomeState.js";

const DEFAULT_WELCOME_IMG = "https://files.catbox.moe/mgqqcn.jpeg";
const DEFAULT_BYE_IMG = "https://files.catbox.moe/tozocs.jpeg";

export default function welcomeEvent(sock, groupCache) {

  console.log("✅ Welcome event registrado");

  sock.ev.on("group-participants.update", async update => {
    try {
      const { id, participants, action } = update;

      // 📦 metadata desde caché o fetch
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
      const groupDesc = metadata?.desc || "Sin descripción";
      const members = metadata?.participants || [];

      for (const user of participants) {
        if (user === sock.user.id) continue;

        const mention = user.split("@")[0];
        const count =
          action === "add"
            ? members.length
            : Math.max(members.length - 1, 0);

        // 🖼️ imagen
        let image;
        try {
          image = await sock.profilePictureUrl(user, "image");
        } catch {
          image = action === "add"
            ? DEFAULT_WELCOME_IMG
            : DEFAULT_BYE_IMG;
        }

        // 🕒 fecha y hora
        const date = new Date();
        const formattedDate = date.toLocaleDateString("es-MX");
        const formattedTime = date.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit"
        });

        // 📛 nombre visible
        const name =
          members.find(p => p.id === user)?.notify ||
          mention ||
          "Usuario";

        // =====================
        // WELCOME
        // =====================
        if (action === "add" && isWelcomeEnabled(id)) {
          const raw = getWelcomeText(id);

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@id/g, mention)
            .replace(/@name/g, name)
            .replace(/@group/g, groupName)
            .replace(/@desc/g, groupDesc)
            .replace(/@count/g, count)
            .replace(/@date/g, formattedDate)
            .replace(/@time/g, formattedTime);

          await sock.sendMessage(id, {
            image: { url: image },
            caption,
            mentions: [user]
          });
        }

        // =====================
        // BYE
        // =====================
        if (action === "remove" && isByeEnabled(id)) {
          const raw = getByeText(id);

          const caption = raw
            .replace(/@user/g, `@${mention}`)
            .replace(/@id/g, mention)
            .replace(/@name/g, name)
            .replace(/@group/g, groupName)
            .replace(/@desc/g, groupDesc)
            .replace(/@count/g, count)
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
