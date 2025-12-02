import { getState, setState } from "../utils/cdmtoggle.js";

export default {
    commands: ["antilink"],
    admin: true,
    category: "on/off",

    async run(sock, msg, args, ctx) {

        // Asegurar que es grupo
        if (!ctx.isGroup)
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Este comando solo funciona en grupos." });

        const jid = msg.key.remoteJid; // <── ESTA ES TU JID REAL
        const estadoActual = getState(jid, "antilink");

        if (!args[0]) {
            return sock.sendMessage(jid, { 
                text: `🔗 *Antilink*: ${estadoActual ? "ACTIVADO ✔️" : "DESACTIVADO ❌"}`
            });
        }

        const opcion = args[0].toLowerCase();

        if (opcion === "on") {
            setState(jid, "antilink", true);
            return sock.sendMessage(jid, { text: "🔗 Antilink ACTIVADO ✔️" });

        } else if (opcion === "off") {
            setState(jid, "antilink", false);
            return sock.sendMessage(jid, { text: "🔗 Antilink DESACTIVADO ❌" });

        } else {
            return sock.sendMessage(jid, { text: "Usa: *.antilink on/off*" });
        }
    }
}
