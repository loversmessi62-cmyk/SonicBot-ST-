export default {
    commands: ["todos", "invocar"],
    admin: true,

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid;

        // 1. Validar que sea grupo
        if (!ctx.isGroup) {
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });
        }

        // 2. Obtener metadata de manera segura SIEMPRE
        let metadata;
        try {
            metadata = ctx.groupMetadata || await sock.groupMetadata(jid);
        } catch (e) {
            return sock.sendMessage(jid, { text: "❌ No pude obtener metadata del grupo." });
        }

        // 3. Validación REAL que evita tu error
        if (!metadata || !Array.isArray(metadata.participants)) {
            return sock.sendMessage(jid, { text: "❌ El grupo no tiene participantes disponibles." });
        }

        // 4. Construir las menciones
        const members = metadata.participants.map(p => p.id);
        const texto = args.length
            ? args.join(" ")
            : "👥 *Etiquetando a todos los miembros del grupo.*";

        await sock.sendMessage(jid, {
            text: texto,
            mentions: members
        });
    }
};
