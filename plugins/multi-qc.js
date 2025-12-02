import axios from "axios";

export default {
    commands: ["qc"],
    category: "multi",

    async run(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const texto = args.join(" ");

        if (!texto)
            return sock.sendMessage(jid, { text: "❌ Escribe un texto.\nEj: .qc Hola" }, { quoted: msg });

        try {
            const APIKEY = "TU_API_KEY_AQUI"; // ← PON TU KEY

            const url = `https://api.nekozuwa.xyz/api/canvas/qc?text=${encodeURIComponent(texto)}&apikey=${APIKEY}`;

            const { data } = await axios.get(url, { responseType: "arraybuffer" });

            await sock.sendMessage(jid, { image: data, caption: "✨ QC generado" }, { quoted: msg });

        } catch (e) {
            console.error("Error QC:", e);
            await sock.sendMessage(jid, { text: "❌ Error al generar QC.\nLa API no respondió." }, { quoted: msg });
        }
    }
};
