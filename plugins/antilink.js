import {
    setAntilinkGroup,
    setAntilinkGlobal
} from "../utils/antilinkState.js";

export default {
    commands: ["antilink"],
    category: "admin",
    admin: true,
    description: "Activa o desactiva el antilink",

    async run(sock, msg, args, ctx) {
        const { jid, isGroup } = ctx;

        const option = args[0]?.toLowerCase();
        const scope = args[1]?.toLowerCase(); // global

        if (!option || !["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: "❌ Uso:\n.antilink on\n.antilink off\n.antilink on global\n.antilink off global"
            }, { quoted: msg });
        }

        const state = option === "on";

        // 🌍 GLOBAL (solo desde privado)
        if (scope === "global") {
            if (isGroup) {
                return sock.sendMessage(jid, {
                    text: "❌ El modo *global* solo se usa en privado."
                }, { quoted: msg });
            }

            setAntilinkGlobal(state);
            return sock.sendMessage(jid, {
                text: `🌍 Antilink global ${state ? "ACTIVADO" : "DESACTIVADO"}`
            });
        }

        // 👥 POR GRUPO
        if (!isGroup) {
            return sock.sendMessage(jid, {
                text: "❌ Este comando solo funciona en grupos."
            });
        }

        setAntilinkGroup(jid, state);

        await sock.sendMessage(jid, {
            text: `👥 Antilink ${state ? "ACTIVADO" : "DESACTIVADO"} en este grupo`
        }, { quoted: msg });
    }
};
