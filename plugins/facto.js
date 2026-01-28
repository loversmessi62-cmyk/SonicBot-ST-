// plugins/facto.js
import fs from 'fs'
import path from 'path'

console.log('🔌 plugins/facto.js: importado')

const DATA_DIR = path.resolve('./data')
const FILE = path.join(DATA_DIR, 'factos.json')

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(FILE)) {
      const defaultFactos = [
        "Eres la razón por la que hay instrucciones en los champús.",
        "Si fueras un libro, serías el que nadie quiere leer.",
        "Tu vida es como un programa de televisión que nadie ve.",
        "Eres como un error tipográfico: solo estás ahí para arruinarlo todo.",
        "Si fueras un producto, serías el que está en oferta porque no se vende.",
        "Eres un recordatorio de lo que no se debe hacer en la vida.",
        "Tu existencia es tan relevante como un archivo en la papelera de reciclaje."
      ]
      fs.writeFileSync(FILE, JSON.stringify({ factos: defaultFactos, usados: [] }, null, 2), 'utf8')
    }
  } catch (e) {
    console.error('[facto] error creando data file:', e)
  }
}

function readData() {
  try {
    ensureDataFile()
    const raw = fs.readFileSync(FILE, 'utf8')
    const parsed = JSON.parse(raw)
    parsed.factos = Array.isArray(parsed.factos) ? parsed.factos.map(s => String(s)) : []
    parsed.usados = Array.isArray(parsed.usados) ? parsed.usados.map(s => String(s)) : []
    return parsed
  } catch (e) {
    console.error('[facto] error leyendo data file:', e)
    return { factos: [], usados: [] }
  }
}

function writeData(data) {
  try {
    ensureDataFile()
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (e) {
    console.error('[facto] error escribiendo data file:', e)
  }
}

export default {
  commands: ['facto', 'fact'],
  tags: ['fun'],
  run: async (sock, msg, args = [], ctx = {}) => {
    try {
      const jid = ctx?.jid || msg?.key?.remoteJid
      if (!jid) return
      console.log('[plugin facto] run invoked for', jid, 'args:', args)

      // Subcomandos:
      // .facto -> devuelve un facto aleatorio (grupo)
      // .facto add <texto> -> añade un facto (solo admins en grupo)
      // .facto list -> lista factos (limitado)
      // .facto remove <index> -> elimina por índice (admins)
      // .facto reset -> reinicia lista de usados (admins)
      const sub = (args[0] || '').toLowerCase()

      // Leer datos
      const data = readData()
      (sub === 'add') {
        // require texto
        const text = args.slice(1).join(' ').trim()
        if (!text) return sock.sendMessage(jid, { text: '❌ Uso: .facto add <texto>' }, { quoted: msg })

        // si es en grupo, pedir admin para añadir (opcional)
        if (ctx.isGroup && !ctx.isAdmin) {
          return sock.sendMessage(jid, { text: '❌ Solo administradores pueden añadir factos en grupos.' }, { quoted: msg })
        }

        data.factos.push(text)
        writeData(data)
        return sock.sendMessage(jid, { text: `✅ Facto añadido (#${data.factos.length}):\n${text}` }, { quoted: msg })
      }

      if (sub === 'list') {
        if (!data.factos.length) return sock.sendMessage(jid, { text: 'ℹ️ No hay factos guardados.' }, { quoted: msg })
        // Limitar salida para evitar mensajes muy largos
        const list = data.factos.slice(0, 200).map((f, i) => `${i + 1}. ${f}`).join('\n\n')
        const more = data.factos.length > 200 ? `\n\n...y ${data.factos.length - 200} más` : ''
        return sock.sendMessage(jid, { text: `📚 Factos (${data.factos.length}):\n\n${list}${more}` }, { quoted: msg })
      }

      if (sub === 'remove') {
        const idx = parseInt(args[1])
        if (isNaN(idx) || idx < 1 || idx > data.factos.length) {
          return sock.sendMessage(jid, { text: '❌ Uso: .facto remove <número válido>' }, { quoted: msg })
        }
        if (ctx.isGroup && !ctx.isAdmin) {
          return sock.sendMessage(jid, { text: '❌ Solo administradores pueden eliminar factos en grupos.' }, { quoted: msg })
        }
        const removed = data.factos.splice(idx - 1, 1)[0]
        // también quitar de usados si estaba
        data.usados = data.usados.filter(x => x !== removed)
        writeData(data)
        return sock.sendMessage(jid, { text: `🗑️ Facto eliminado (#${idx}):\n${removed}` }, { quoted: msg })
      }

      if (sub === 'reset') {
        if (ctx.isGroup && !ctx.isAdmin) {
          return sock.sendMessage(jid, { text: '❌ Solo administradores pueden reiniciar usados en grupos.' }, { quoted: msg })
        }
        data.usados = []
        writeData(data)
        return sockMessage(jid, { text: '🔁 Lista de factos usados reiniciada.' }, { quoted: msg })
      }

      // Por defecto -> enviar un facto aleatorio
      // Requerir ser en grupo si lo quieres (tu handler antes lo marcaba así), dejo la comprobación:
      if (!ctx.isGroup) {
        return sock.sendMessage(jid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg })
      }

      // Asegurar lista
      const factosValidos = Array.isArray(data.factos) ? data.factos.filter(Boolean) : []
      if (!factosValidos.length) return sock.sendMessage(jid, { text: 'ℹ️ No hay factos disponibles.' }, { quoted: msg })

      // Elegir disponibles (no usados)
      const disponibles = factosValidos.filter(f => !data.usados.includes(f))

      // Si ya se usaron todos, reiniciar usados
      if (disponibles.length === 0) {
        data.usados = []
        writeData(data)
      }

      const pool = disponibles.length ? disponibles : factosValidos
      let elegido = pickRandom(pool)
      if (!elegido || !String(elegido).trim()) elegido = 'No se encontró un facto disponible.'

      // Marcar como usado y guardar
      data.usados.push(elegido)
      // Limpiar duplicados en usados (por seguridad)
      data.usados = Array.from(new Set(data.usados))
      writeData(data)

      // Enviar con formato
      const header = '*┏━_͜͡- FACTO -͜͡_━┓*'
      const footer = '*┗━_͜͡- FIN -͜͡_━┛*'
      const text = `${header}\n\n❥ *\"${String(elegido).replace(/\n+/g, ' ')}\"*\n\n${footer}`

      awaiterr) {
      console.error('[plugin facto] error:', err)
      const jid = ctx?.jid || msg?.key?.remoteJid
      if (jid) await sock.sendMessage(jid, { text: `❌ Error:\n${err.message}` }, { quoted: msg })
    }
  }
}