import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const filePath = "./ventas.json";

const commandsList = [
"disney","actas","adicionales","alimentos","autobus","boletos","canva","certificados","citas","codigos","combo","combos2","combos3","combos4","combos5","constancias","diamantes","descuentos","dinamica","facturas","fichareportes","gamepass","hbo","imss","justificantes","linkreportes","linkcodigos","libros","lote","maxeo","numerovirtual","netflix","prime","pasesff","pago","pago2","pago3","pago4","pago5","paquete","paquete2","paquete3","paquete4","paquete5","pedrial","peliculas","promo","procesos","programas","promoday","preciosbot","rebote","recargas","recetas","reembolsos","reglas","reportes","rfc","servicios","seguros","spotify","stock","stock2","stock3","stock4","stock5","stock6","stock7","stock8","stock9","stock10","shein","tanda","tramites","universidad","vigencia","vuelos","vix","universal","youtube"
];

export default {
  commands: commandsList.flatMap(cmd => [`set${cmd}`, cmd, `del${cmd}`]),
  category: "ventas",
  admin: true,
  group: true,

  async run(sock, msg, args, ctx) {
    const chatId = ctx.jid;

    let dataBase = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : {};

    if (!dataBase[chatId]) dataBase[chatId] = {};

    const command = ctx.command;
    const baseCommand = command.replace(/^set|^del/, "");
    const prev = dataBase[chatId][baseCommand] || {};

    if (command.startsWith("set")) {
      const text = args.join(" ").trim();

      const quoted = msg.quoted;
      const directImage = msg.message?.imageMessage;
      const quotedImage = quoted?.message?.imageMessage;

      const texto =
        text ||
        msg.body?.replace(new RegExp(`^${ctx.prefix}${command}`, "i"), "").trim() ||
        quoted?.text ||
        quoted?.caption ||
        "";

      if (!texto && !directImage && !quotedImage) {
        return sock.sendMessage(
          ctx.jid,
          { text: `⚠️ Envía o responde a texto o imagen.\n> ${ctx.prefix}${command} ejemplo` },
          { quoted: msg }
        );
      }

      let imagenBase64 = null;

      try {
        if (quotedImage) {
          const stream = await downloadContentFromMessage(quoted.message.imageMessage, "image");
          let buffer = Buffer.alloc(0);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          imagenBase64 = buffer.toString("base64");
        } else if (directImage) {
          const stream = await downloadContentFromMessage(msg.message.imageMessage, "image");
          let buffer = Buffer.alloc(0);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          imagenBase64 = buffer.toString("base64");
        }
      } catch {}

      dataBase[chatId][baseCommand] = {
        texto: texto || prev.texto || "",
        imagen: imagenBase64 ?? prev.imagen ?? null
      };

      fs.writeFileSync(filePath, JSON.stringify(dataBase, null, 2));

      return sock.sendMessage(
        ctx.jid,
        { text: `✅ ${baseCommand} guardado correctamente` },
        { quoted: msg }
      );
    }

    if (command.startsWith("del")) {
      if (!dataBase[chatId][baseCommand]) {
        return sock.sendMessage(
          ctx.jid,
          { text: "⚠️ No hay datos para eliminar" },
          { quoted: msg }
        );
      }

      delete dataBase[chatId][baseCommand];
      fs.writeFileSync(filePath, JSON.stringify(dataBase, null, 2));

      return sock.sendMessage(
        ctx.jid,
        { text: `🚮 ${baseCommand} eliminado correctamente` },
        { quoted: msg }
      );
    }

    const data = dataBase[chatId][baseCommand];

    if (!data || (!data.texto && !data.imagen)) {
      return sock.sendMessage(
        ctx.jid,
        { text: `⚠️ No hay información\n> Usa ${ctx.prefix}set${baseCommand}` },
        { quoted: msg }
      );
    }

    if (data.imagen) {
      const buffer = Buffer.from(data.imagen, "base64");
      return sock.sendMessage(
        ctx.jid,
        {
          image: buffer,
          caption: data.texto || baseCommand
        },
        { quoted: msg }
      );
    }

    return sock.sendMessage(
      ctx.jid,
      { text: data.texto },
      { quoted: msg }
    );
  }
};