import { exec } from "child_process"

let handler = async (m, { conn, isOwner }) => {
 if (!isOwner) return m.reply("❌ Solo el *OWNER* puede usar este comando.")

 m.reply("🔄 Actualizando el bot...\nEsto puede tardar unos segundos.")

 exec("git pull", (err, stdout) => {

   if (err) {
     return m.reply("⚠️ Error ejecutando *git pull*:\n\n" + err.message)
   }

   if (stdout.includes("Already up to date")) {
     return m.reply("✅ El bot ya está actualizado.")
   }

   m.reply("✅ Actualización descargada.\n♻️ Reiniciando...")

   // Si usas pm2
   exec("pm2 restart all")

   // Si NO usas pm2 y lo corres con: node index.js
   // NO se reinicia solo — tendrás que cerrar y abrir manualmente
 })
}

handler.help = ["update"]
handler.tags = ["owner"]
handler.command = ["update"]
handler.owner = true

export default handler
