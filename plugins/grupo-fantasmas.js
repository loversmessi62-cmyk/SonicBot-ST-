import { store } from "../handler.js";

export default {
    commands: ["fantasmas"],
    category: "group",
    admin: true, // solo admins
    description: "Menciona a los inactivos del grupo basándose en sus mensajes enviados.",

    async run(sock, msg, args, ctx) {
        const { jid, groupMetadata, participants } = ctx;

        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        const chatId = jid;

        // Asegurar que el grupo tenga registro
        if (!store.chats[chatId]) {
            store.chats[chatId] = {};
        }

        // Cuenta de mensajes del grupo
        const messageCount = store.chats[chatId];

        // Convertir lista de participantes en datos útiles
        let lista = participants.map(p => {
            const id = p.id || p.jid;
            const count = messageCount[id] || 0;

            return {
                id,
                count
            };
        });

        // Ordenar de menor a mayor mensajes (FANTASMAS arriba)
        lista.sort((a, b) => a.count - b.count);

        // Detectar fantasmas (0 mensajes o muy pocos)
        const fantasmas = lista.filter(u => u.count <= 1);

        if (fantasmas.length === 0) {
            return sock.sendMessage(jid, {
                text: "✨ No hay fantasmas, todos han hablado recientemente."
            });
        }

        // Construir mensaje
        let texto = `👻 *FANTASMAS DEL GRUPO*\n`;
        texto += `Los siguientes usuarios tienen *0 a 1 mensajes enviados*:\n\n`;

        let mentions = [];

        for (let u of fantasmas) {
            const num = u.id.split("@")[0];
            texto += `• @${num} → ${u.count} mensajes\n`;
            mentions.push(u.id);
        }

        await sock.sendMessage(jid, {
            text: texto,
            mentions
        });
    }
};
