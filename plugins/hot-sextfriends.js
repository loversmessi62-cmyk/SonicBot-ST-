export default {
    commands: ["sexfriends", "pairhot"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const meta = ctx.groupMetadata;
        const participants = meta.participants.map(p => p.id);

        const p1 = participants[Math.floor(Math.random() * participants.length)];
        let p2 = participants[Math.floor(Math.random() * participants.length)];

        while (p2 === p1) {
            p2 = participants[Math.floor(Math.random() * participants.length)];
        }

        await sock.sendMessage(ctx.jid, {
            text: `
🔥 *PAREJA HOT DEL DÍA* 🔥

💋 ${"@" + p1.split("@")[0]}
🔥 con
💋 ${"@" + p2.split("@")[0]}

Perfectos para un buen roleplay 😏🔥
            `,
            mentions: [p1, p2]
        });
    }
};
