export default {
    commands: ["randoms2"],
    category: "owner",
    owner: true, // 🔥 SOLO OWNER

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        const frases = [
        "👑 Mi creador es el más pitudo de acá",
        "🔥 El dueño de este bot es otro nivel",
        "😎 Mi creador es el más pro de todos",
        "💎 El patrón siempre destacando",
        "🚀 Mi creador es pura calidad",
        "😈 El jefe manda y todos respetan",
        "👑 Mi creador es el número 1",
        "🔥 El dueño del bot tiene flow de sobra",
        "😎 Mi creador es el más crack",
        "💎 El patrón siempre brillando",
        "🚀 Mi creador nunca falla",
        "😈 El jefe es el más duro",
        "👑 Mi creador domina todo",
        "🔥 El dueño es puro poder",
        "😎 Mi creador es leyenda",
        "💎 El patrón tiene nivel dios",
        "🚀 Mi creador es imparable",
        "😈 El jefe siempre gana",
        "👑 Mi creador es único",
        "🔥 El dueño es el más respetado"
        ];

        const frase = frases[Math.floor(Math.random() * frases.length)];

        await sock.sendMessage(jid, {
            text: frase
        }, { quoted: msg });
    }
};