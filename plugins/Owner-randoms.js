export default {
    commands: ["randoms2"],
    category: "owner",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid;

        // 🔥 TU LID (CREADOR)
        const creador = "190886046613743@lid";

        // 🔥 +60 RESPUESTAS GROCERAS
        const bloqueos = [
        "💀 Pendejo, tú no eres el creador",
        "😈 Este comando no es tuyo, ubícate pdj",
        "🤡 Ni eres el creador y ya quieres usar esto",
        "💩 No mames, este comando es del dueño, no tuyo",
        "🐀 Mejor cállate pendejo, esto no te pertenece",
        "🔥 Estás bien pendejo, no eres el creador",
        "😤 Ni eres el dueño y ya andas de metiche",
        "💀 Pinche metiche, esto no es para ti",
        "😹 No eres el creador pendejo, ni lo intentes",
        "🤡 Te falta nivel para usar esto",
        "💩 Pinche pendejo metiche",
        "😈 Este comando te queda grande",
        "🔥 Ubícate pendejo, no eres el creador",
        "🐀 Ni permiso tienes y ya andas usando cosas",
        "💀 Estás bien pendejo si crees que puedes usar esto",
        "😤 Mejor ni intentes, no es tuyo",
        "🤡 Pobre pendejo queriendo usar comandos ajenos",
        "💩 Esto no es para ti, estúpido",
        "😈 Ni eres dueño y ya te crees algo",
        "🔥 Pinche pendejo sin acceso",
        "🐀 Ni sabes y ya andas tocando",
        "💀 Este comando no es para gente como tú",
        "😹 Das pena intentando usar esto",
        "🤡 Mejor vete pendejo",
        "💩 Estás bien estúpido si crees que puedes usarlo",
        "😈 No eres el creador, ubícate",
        "🔥 Este comando no es para pendejos",
        "🐀 Ni tú te crees que puedes usarlo",
        "💀 Mejor ni le muevas",
        "😤 Estás bien pendejo si insistes",
        "🤡 Te falta cerebro para esto",
        "💩 No tienes nivel para este comando",
        "😈 Pinche estúpido, no es tuyo",
        "🔥 No tienes permiso pendejo",
        "🐀 Mejor cállate y ya",
        "💀 Ni en tus sueños lo usas",
        "😹 Pobre pendejo intentándolo",
        "🤡 Estás bien menso",
        "💩 No eres nadie aquí",
        "😈 Este comando es solo del jefe",
        "🔥 Pinche metiche de mierda",
        "🐀 Ni sabes usar el bot",
        "💀 Mejor aprende primero",
        "😤 Estás bien perdido",
        "🤡 Das pena usando comandos",
        "💩 No sirves para esto",
        "😈 Ni eres importante aquí",
        "🔥 Este comando no es para ti",
        "🐀 Vete a otro lado",
        "💀 Nadie te dio permiso",
        "😹 Estás bien wey",
        "🤡 No tienes acceso",
        "💩 Mejor ni hables",
        "😈 Te crees mucho y no eres nada",
        "🔥 Ni el bot te reconoce",
        "🐀 Mejor desaparece",
        "💀 No eres el creador, fin",
        "😤 No insistas pendejo",
        "🤡 Te falta todo para usar esto",
        "💩 Pinche intento fallido"
        ];

        // 🔥 VALIDACIÓN
        if (ctx.sender !== creador) {
            const txt = bloqueos[Math.floor(Math.random() * bloqueos.length)];
            return sock.sendMessage(jid, {
                text: txt
            }, { quoted: msg });
        }

        // 🔥 FRASES PARA EL CREADOR
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