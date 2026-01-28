// ================= FACTO =================

// Inicializar factos globales (una sola vez)
if (!global.factos) {
  global.factos = [
    "Eres la razón por la que hay instrucciones en los champús.",
    "Si fueras un libro, serías el que nadie quiere leer.",
    "Tu vida es como un programa de televisión que nadie ve.",
    "Eres como un error tipográfico: solo estás ahí para arruinarlo todo.",
    "Si fueras un producto, serías el que está en oferta porque no se vende.",
    "Eres un recordatorio de lo que no se debe hacer en la vida.",
    "Tu existencia es tan relevante como un archivo en la papelera de reciclaje.",
    "Si fueras un plato, serías uno que nadie quiere probar.",
    "Tu personalidad es como un antivirus: nadie lo quiere instalar.",
    "Eres la prueba de que la selección natural puede fallar.",
    "Si fueras un color, serías el gris: aburrido y sin vida.",
    "Tu vida es como una mala película: nadie quiere ver el final.",
    "Eres como un mal chiste: siempre haces que la gente se sienta incómoda.",
    "Si fueras un animal, serías la mascota que nadie quiere adoptar.",
    "Tu sentido del humor es como un mal Wi-Fi: no tiene conexión.",
    "Eres como una planta marchita: solo ocupas espacio.",
    "Tu vida es un meme, pero nadie se ríe.",
    "Si fueras una aplicación, serías una que nadie quiere descargar.",
    "Si fueras un día de la semana, serías lunes: nadie te quiere."
  ];
}

if (!global.factosUsados) global.factosUsados = [];

export default {
  commands: ["facto"],
  group: true,

  async run(sock, msg, args, ctx) {
    const jid = ctx.jid;

    // Mensaje de espera
    await sock.sendMessage(
      jid,
      { text: "⌛ Buscando un facto, espere un momento..." },
      { quoted: msg }
    );

    // Reiniciar si ya se usaron todos
    if (global.factosUsados.length >= global.factos.length) {
      global.factosUsados = [];
    }

    // Elegir uno no repetido
    const disponibles = global.factos.filter(
      f => !global.factosUsados.includes(f)
    );

    const elegido =
      disponibles[Math.floor(Math.random() * disponibles.length)];

    global.factosUsados.push(elegido);

    const texto = `
*┏━━━━━━━━━━━━━━━━━━━━┓*

❥ *"${elegido}"*

*┗━━━━━━━━━━━━━━━━━━━━┛*
`.trim();

    await sock.sendMessage(
      jid,
      { text: texto },
      { quoted: msg }
    );
  }
};