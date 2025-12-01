export default {
    commands: ["todos", "invocar"],
    admin: true,

    async run(sock, msg, args, ctx) {

        const jid = ctx.jid;

        if (!ctx.isGroup)
            return sock.sendMessage(jid, { text: "❌ Este comando solo funciona en grupos." });

        // Metadata segura
        let metadata = ctx.groupMetadata;

        if (!metadata) {
            try {
                metadata = await sock.groupMetadata(jid);
            } catch (e) {
                return sock.sendMessage(jid, { text: "❌ No pude obtener metadata del grupo." });
            }
        }

        // Validaciones blindadas
        if (!metadata || typeof metadata !== "object")
            return sock.sendMessage(jid, { text: "❌ Metadata inválida." });

        if (!Array.isArray(metadata.participants))
            return sock.sendMessage(jid, { text: "❌ No hay participantes cargados." });

        // Construcción SEGURA de menciones
        const members = metadata.participants
            .filter(p => p && p.id)
            .map(p => p.id);

        if (!members.length)
            return sock.sendMessage(jid, { text: "❌ No se pudieron obtener los IDs del grupo." });

        const texto = args.length
            ? args.join(" ")
            : "👥 *Etiquetando a todos los miembros del grupo.*";

        await sock.sendMessage(jid, {
            text: texto,
            mentions: members
        });
    }
};
