export default {
    commands: ["kick", "ban"],
    category: "admin",
    admin: true,
    description: "Expulsa uno o varios usuarios (respondiendo o mencionando).",

    async run(sock, msg) {
        const jid = msg.key.remoteJid;
        const m = msg.message || {};

        let targets = [];

        // 1️⃣ Si responde a un mensaje
        const replied =
            m?.extendedTextMessage?.contextInfo?.participant;

        if (replied) targets.push(replied);

        // 2️⃣ Si menciona con @ (pueden ser varios)
        const mentioned =
            m?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentioned.length) {
            targets.push(...mentioned);
        }

        // ❌ Si no hay usuarios
        if (targets.length === 0) {
            return sock.sendMessage(
                jid,
                { text: "❌ Responde a un mensaje o menciona uno o varios usuarios (@usuario)." },
                { quoted: msg }
            );
        }

        // 🔁 Eliminar duplicados
        targets = [...new Set(targets)];

        // 🚫 Evitar auto-kick
        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        targets = targets.filter(u => u !== botId);

        if (targets.length === 0) {
            return sock.sendMessage(
                jid,
                { text: "❌ No puedo expulsarme a mí mismo." },
                { quoted: msg }
            );
        }

        try {
            await sock.groupParticipantsUpdate(jid, targets, "remove");

            await sock.sendMessage(
                jid,
                { text: `🦶 Usuarios expulsados: ${targets.length}` },
                { quoted: msg }
            );
        } catch (e) {
            console.error("❌ Error kick:", e);
            await sock.sendMessage(
                jid,
                { text: "❌ No pude expulsar a uno o más usuarios (¿soy admin?)." },
                { quoted: msg }
            );
        }
    }
};
