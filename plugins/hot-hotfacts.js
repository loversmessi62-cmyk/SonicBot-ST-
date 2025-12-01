export default {
    commands: ["hotfact", "sexfact"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const facts = [
            "El promedio de duración del sexo es de 5 a 7 minutos 😏",
            "El clímax libera sustancias más fuertes que la morfina 🔥",
            "El 62% de personas piensa en sexo diario 👀",
            "El deseo aumenta en ambientes calientes 🌡️",
            "Los besos intensos queman calorías 😘🔥"
        ];

        const fact = facts[Math.floor(Math.random() * facts.length)];

        await sock.sendMessage(ctx.jid, {
            text: `🔥 *Dato Hot:* ${fact}`
        });
    }
};
