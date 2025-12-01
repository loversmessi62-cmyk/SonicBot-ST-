import baileys from "@whiskeysockets/baileys";

export default {
    commands: ["todos", "invocar"],
    admin: true,
    category: "admin",

    async run(sock, msg, args, ctx) {

        // 1. Validar que sea grupo
        const jid = msg.key.remoteJid;
        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        // 2. Obtener metadata del grupo correctamente
        let metadata;
        try {
            metadata = await sock.groupMetadata(jid);
        } catch (e) {
            return sock.sendMessage(jid, { text: "❌ No pude obtener los datos del grupo." });
        }

        // 3. Validación fuerte por si regresa null o undefined
        if (!metadata || !metadata.participants) {
            return sock.sendMessage(jid, { text: "❌ Error inesperado: metadata del grupo vacía." });
        }

        // 4. Construir menciones
        const members = metadata.participants.map(p => p.id);
        const texto = args.length ? args.join(" ") : "👥 *Etiquetando a todos los miembros*";

        await sock.sendMessage(jid, {
            text: texto,
            mentions: members
        });
    }
};
