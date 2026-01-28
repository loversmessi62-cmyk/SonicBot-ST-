// plugins/facto.js
console.log('🔌 plugins/facto.js: importado')

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export default {
  commands: ['facto', 'fact'],
  tags: ['fun'],
  run: async (sock, msg, args, ctx) => {
    try {
      const jid = ctx?.jid || msg?.key?.remoteJid
      if (!jid) return

      console.log('[plugin facto] run invoked for', jid)

      // Si quieres que funcione SOLO en grupos (tu handler antiguo lo marcaba así)
      if (!ctx?.isGroup) {
        return sock.sendMessage(jid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg })
      }

      // Mensaje inicial (opcional)
      const searchingEmoji = '⌛'
      await sock.sendMessage(jid, { text: `${searchingEmoji} Buscando un facto, espere un momento...` }, { quoted: msg })

      // Lista de factos (puedes editar/añadir)
      if (!global.factos || !Array.isArray(global.factos)) {
        global.factos = [
          "Eres la razón por la que hay instrucciones en los champús.",
          "Si fueras un libro, serías el que nadie quiere leer.",
          "Tu vida es como un programa de televisión que nadie ve.",
          "Eres como un error tipográfico: solo estás ahí para arruinarlo todo.",
          "Si fueras un producto, serías el que está en oferta porque no se vende.",
          "Eres un recordatorio de lo que no se debe hacer en la vida.",
          "Tu existencia es tan relevante como un archivo en la papelera de reciclaje.",
          "Si fueras un plato, serías uno que nadie quiere probar.",
          "Eres la razón por la que los hombres tienen miedo de comprometerse.",
          "Tu personalidad es como un antivirus: nadie lo quiere instalar.",
          "Eres la prueba de que la selección natural puede fallar.",
          "Si fueras un color, serías el gris: aburrido y sin vida.",
          "Tu vida es como una mala película: nadie quiere ver el final.",
          "Eres como un mal chiste: siempre haces que la gente se sienta incómoda.",
          "Si fueras un animal, serías la mascota que nadie quiere adoptar.",
          "Tu sentido del humor es como un mal Wi-Fi: no tiene conexión.",
          "Eres como una planta marchita: solo ocupas espacio.",
          "Si fueras un virus informático, serías uno que causa más problemas que soluciones.",
          "Tu imagen es la razón por la que los espejos están cubiertos.",
          "Eres el ejemplo perfecto de cómo no vivir la vida.",
          "Si fueras un día de la semana, serías un lunes: todos te odian.",
          "Eres la razón por la que las personas no creen en el amor verdadero.",
          "Tu vida es un meme, pero nadie se ríe.",
          "Si fueras una aplicación, serías una que nadie quiere descargar.",
          "Eres como una sombra: siempre estás ahí, pero no eres bienvenido.",
          "Tu cerebro es como un disco duro lleno: no puede almacenar más.",
          "Eres como un tren descarrilado: solo causan caos.",
          "Si fueras un clima, serías una tormenta: oscuro y destructivo.",
          "Eres como una cadena de mensajes: nadie te quiere, pero todos te reciben.",
          "Tu vida es como un rompecabezas con piezas que nunca encajan.",
          "Si fueras una película, serías una secuela que nadie pidió."
        ]
      }

      if (!global.factosUsados || !Array.isArray(global.factosUsados)) global.factosUsados = []

      // Reiniciar usados si ya se consumieron todos
      if (global.factosUsados.length >= global.factos.length) global.factosUsados = []

      const disponibles = global.factos.filter(f => !global.factosUsados.includes(f))
      const elegido = disponibles.length ? pickRandom(disponibles) : pickRandom(global.factos)

      global.factosUsados.push(elegido)

      const result = `*┏━_͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘n\n*┗━_͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡⚘-͜͡-͜͡-͜͡-͜͡-͜͡-͜͡_͜͡━┛*`

      await sock.sendMessage(jid, { text: result }, { quoted: msg })
    } catch (err) {
      console.error('[plugin facto] error:', err)
      const jid = ctx?.jid || msg?.key?.remoteJid
      if (jid) await sock.sendMessage(jid, { text: `❌ Error:\n${err.message}` }, { quoted: msg })
    }
  }
}