const quoted = msg.message?.extendedTextMessage?.contextInfo;
const mimeQ = quoted?.quotedMessage?.imageMessage
    ? "image"
    : quoted?.quotedMessage?.videoMessage
    ? "video"
    : null;

// SI NO HAY QUOTED (RESPONDIDO), REVISAMOS SI ÉL MANDÓ LA IMAGEN DIRECTAMENTE
let mtype;
if (mimeQ) {
    // Imagen o video citado
    mtype = mimeQ;
} else if (msg.message?.imageMessage) {
    mtype = "image";
} else if (msg.message?.videoMessage) {
    mtype = "video";
} else {
    return sock.sendMessage(jid, { text: "⚠️ Responde a una imagen o video con .s" }, { quoted: msg });
}

let buffer;

// SI ES QUOTED
if (mimeQ) {
    buffer = await sock.downloadMediaMessage({
        message: quoted.quotedMessage,
        key: {
            remoteJid: msg.key.remoteJid,
            id: msg.key.id,
            fromMe: false
        }
    });
} else {
    // SI ES DIRECTO (no respondido)
    buffer = await sock.downloadMediaMessage(msg);
}

await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
