import axios from "axios";

export default {
    commands: ["qc"],
    category: "multi",
    admin: false,
    description: "Genera un QC con tu texto.",

    async run(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const texto = args.join(" ");

        if (!texto)
            return sock.sendMessage(jid, { text: "❌ Escribe un texto.\nEj: .qc Hola" }, { quoted: msg });

        try {
            const api = `https://api.tioo.eu.org/canvas/qc?text=${encodeURIComponent(texto)}`;

            const { data } = await axios.get(api, { responseType: "arraybuffer" });

            await sock.sendMessage(jid, { image: data, caption: "✨ QC generado" }, { quoted: msg });

        } catch (e) {
            console.error("Error QC:", e);
            await sock.sendMessage(jid, { text: "❌ La API no respondió.\nIntenta más tarde." }, { quoted: msg });
        }
    }
};
