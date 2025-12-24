import moment from "moment-timezone"

const rooms = {}

const zones = {
  mx: "America/Mexico_City",
  co: "America/Bogota",
  ar: "America/Argentina/Buenos_Aires",
  cl: "America/Santiago",
  pe: "America/Lima",
  es: "Europe/Madrid"
}

function parseTime(text = "") {
  const match = text.match(/(\d{1,2})(am|pm)\s*(\w+)?/i)
  if (!match) return null

  let [, hour, ampm, zone] = match
  zone = zone?.toLowerCase()
  const tz = zones[zone] || null

  let h = parseInt(hour)
  if (ampm.toLowerCase() === "pm" && h < 12) h += 12
  if (ampm.toLowerCase() === "am" && h === 12) h = 0

  if (!tz) return `${hour}${ampm}`
  return moment().tz(tz).hour(h).minute(0).format("HH:mm z")
}

function render(room) {
  return `
🎮 *4 VS 4*
${room.time ? `⏰ Hora: *${room.time}*` : ""}

👥 *Jugadores (${room.players.length}/4)*
${room.players.map((u,i)=>`${i+1}. @${u.split("@")[0]}`).join("\n") || "-"}

🪑 *Suplentes (${room.subs.length}/2)*
${room.subs.map((u,i)=>`${i+1}. @${u.split("@")[0]}`).join("\n") || "-"}

❤️ = Jugar
👍 = Suplente
❌ = Salir
`
}

let handler = async (m, { conn, text }) => {
  const time = parseTime(text)
  const id = m.chat

  rooms[id] = {
    players: [],
    subs: [],
    time
  }

  const msg = await conn.sendMessage(id, {
    text: render(rooms[id]),
    mentions: []
  })

  rooms[id].msgId = msg.key.id

  await conn.sendMessage(id, { react: { text: "❤️", key: msg.key } })
  await conn.sendMessage(id, { react: { text: "👍", key: msg.key } })
  await conn.sendMessage(id, { react: { text: "❌", key: msg.key } })
}

handler.before = async (m, { conn }) => {
  if (!m.message?.reactionMessage) return

  const { key, text } = m.message.reactionMessage
  const room = rooms[m.chat]
  if (!room || key.id !== room.msgId) return

  const user = m.sender

  room.players = room.players.filter(u => u !== user)
  room.subs = room.subs.filter(u => u !== user)

  if (text === "❤️" && room.players.length < 4) {
    room.players.push(user)
  }

  if (text === "👍" && room.subs.length < 2) {
    room.subs.push(user)
  }

  const newText = render(room)

  await conn.sendMessage(m.chat, {
    text: newText,
    mentions: [...room.players, ...room.subs]
  }, { edit: key })
}

handler.command = /^4vs4$/i
handler.tags = ["games"]
handler.help = ["4vs4 [hora zona]"]

export default handler