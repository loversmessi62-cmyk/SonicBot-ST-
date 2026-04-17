let handler = async (m, { conn }) => {

// 🔥 BASES GROCERAS
const sujetos = [
"pinche pendejo", "estúpido de mierda", "pendeja inútil",
"maldito pendejo", "estúpida sin cerebro", "pendejo asqueroso",
"idiota pendejo", "pendeja culera", "estúpido inútil",
"pendejo sin vida"
];

const inicios = [
"Eres", "Neta eres", "Siempre serás", "La verdad eres",
"No cabe duda que eres", "Confirmo que eres",
"Definitivamente eres", "Literal eres", "100% eres", "Qué pedo eres"
];

const finales = [
" que no sirve pa nada",
" bien pendejo",
" y la cagas siempre",
" sin cerebro",
" que solo estorba",
" bien inútil",
" que da pena ajena",
" que no entiende nada",
" todo idiota",
" versión basura",
" modo pendejo activado",
" que solo dice mamadas",
" sin arreglo alguno",
" que no vale nada",
" nivel máximo de estupidez",
" que arruina todo",
" bien culero",
" que nadie aguanta",
" que ni piensa",
" que da asco"
];

// 🔥 GENERAR 200 FRASES
let frases = [];

for (let i = 0; i < 200; i++) {
    const a = inicios[Math.floor(Math.random() * inicios.length)];
    const b = sujetos[Math.floor(Math.random() * sujetos.length)];
    const c = finales[Math.floor(Math.random() * finales.length)];

    frases.push(`💀 ${a} ${b}${c}`);
}

// 🔥 ELEGIR UNA
const frase = frases[Math.floor(Math.random() * frases.length)];

await conn.sendMessage(m.chat, {
    text: frase
}, { quoted: m });

}

handler.help = ['randoms']
handler.command = ['randoms']
handler.tags = ['fun']

export default handler;