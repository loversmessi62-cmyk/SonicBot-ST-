export default {
  commands: ["menustore", "store", "ventasmenu"],
  category: "ventas",
  admin: false,
  group: false,

  async run(sock, msg, args, ctx) {

    const usedPrefix = ctx.prefix || "."

    const menu = `╭┈┈⊰  🌷 𝗩𝗘𝗡𝗧𝗔𝗦 🌷
┊ 🌷 ${usedPrefix}disney
┊ 🌷 ${usedPrefix}actas
┊ 🌷 ${usedPrefix}adicionales
┊ 🌷 ${usedPrefix}alimentos
┊ 🌷 ${usedPrefix}autobus
┊ 🌷 ${usedPrefix}boletos
┊ 🌷 ${usedPrefix}canva
┊ 🌷 ${usedPrefix}certificados
┊ 🌷 ${usedPrefix}citas
┊ 🌷 ${usedPrefix}codigos
┊ 🌷 ${usedPrefix}combo
┊ 🌷 ${usedPrefix}combos2
┊ 🌷 ${usedPrefix}combos3
┊ 🌷 ${usedPrefix}combos4
┊ 🌷 ${usedPrefix}combos5
┊ 🌷 ${usedPrefix}constancias
┊ 🌷 ${usedPrefix}diamantes
┊ 🌷 ${usedPrefix}descuentos
┊ 🌷 ${usedPrefix}dinamica
┊ 🌷 ${usedPrefix}facturas
┊ 🌷 ${usedPrefix}fichareportes
┊ 🌷 ${usedPrefix}gamepass
┊ 🌷 ${usedPrefix}hbo
┊ 🌷 ${usedPrefix}imss
┊ 🌷 ${usedPrefix}justificantes
┊ 🌷 ${usedPrefix}linkreportes
┊ 🌷 ${usedPrefix}linkcodigos
┊ 🌷 ${usedPrefix}libros
┊ 🌷 ${usedPrefix}lote
┊ 🌷 ${usedPrefix}maxeo
┊ 🌷 ${usedPrefix}numerovirtual
┊ 🌷 ${usedPrefix}netflix
┊ 🌷 ${usedPrefix}prime
┊ 🌷 ${usedPrefix}pasesff
┊ 🌷 ${usedPrefix}pago
┊ 🌷 ${usedPrefix}pago2
┊ 🌷 ${usedPrefix}pago3
┊ 🌷 ${usedPrefix}pago4
┊ 🌷 ${usedPrefix}pago5
┊ 🌷 ${usedPrefix}paquete
┊ 🌷 ${usedPrefix}paquete2
┊ 🌷 ${usedPrefix}paquete3
┊ 🌷 ${usedPrefix}paquete4
┊ 🌷 ${usedPrefix}paquete5
┊ 🌷 ${usedPrefix}pedrial
┊ 🌷 ${usedPrefix}peliculas
┊ 🌷 ${usedPrefix}promo
┊ 🌷 ${usedPrefix}procesos
┊ 🌷 ${usedPrefix}programas
┊ 🌷 ${usedPrefix}promoday
┊ 🌷 ${usedPrefix}preciosbot
┊ 🌷 ${usedPrefix}rebote
┊ 🌷 ${usedPrefix}recargas
┊ 🌷 ${usedPrefix}recetas
┊ 🌷 ${usedPrefix}reembolsos
┊ 🌷 ${usedPrefix}reglas
┊ 🌷 ${usedPrefix}reportes
┊ 🌷 ${usedPrefix}rfc
┊ 🌷 ${usedPrefix}servicios
┊ 🌷 ${usedPrefix}seguros
┊ 🌷 ${usedPrefix}spotify
┊ 🌷 ${usedPrefix}stock
┊ 🌷 ${usedPrefix}stock2
┊ 🌷 ${usedPrefix}stock3
┊ 🌷 ${usedPrefix}stock4
┊ 🌷 ${usedPrefix}stock5
┊ 🌷 ${usedPrefix}stock6
┊ 🌷 ${usedPrefix}stock7
┊ 🌷 ${usedPrefix}stock8
┊ 🌷 ${usedPrefix}stock9
┊ 🌷 ${usedPrefix}stock10
┊ 🌷 ${usedPrefix}shein
┊ 🌷 ${usedPrefix}tanda
┊ 🌷 ${usedPrefix}tramites
┊ 🌷 ${usedPrefix}universidad
┊ 🌷 ${usedPrefix}vigencia
┊ 🌷 ${usedPrefix}vuelos
┊ 🌷 ${usedPrefix}vix
┊ 🌷 ${usedPrefix}universal
┊ 🌷 ${usedPrefix}youtube
╰┈┈⊰ 🌷`

    await sock.sendMessage(
      ctx.jid,
      { text: menu },
      { quoted: msg }
    );
  }
};