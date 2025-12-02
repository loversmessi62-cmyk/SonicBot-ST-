import axios from "axios";

export default {
    commands: ["qc"],
    category: "multi",
    admin: false,
    description: "Genera un QC con la frase que escribas.",

    async run(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const texto = args.join(" ");

        if (!texto)
            return sock.sendMessage(jid, { text: "❌ Escribe un texto para el QC.\nEjemplo: .qc Hola" }, { quoted: msg });

        try {
            const api = `https://widipe.com/qc?text=${encodeURIComponent(texto)}&username=adri`;

            const { data } = await axios.get(api, { responseType: "arraybuffer" });

            await sock.sendMessage(jid, { image: data, caption: "✨ QC generado" }, { quoted: msg });

        } catch (e) {
            console.error("Error QC:", e);
            await sock.sendMessage(jid, { text: "❌ Error generando el QC. La API no respondió." }, { quoted: msg });
        }
    }
};
