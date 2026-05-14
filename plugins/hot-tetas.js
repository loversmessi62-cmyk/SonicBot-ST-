export default {
    commands: ["tetas"],
    category: "hot",

    async run(sock, msg, args, ctx) {
        const jid = ctx.jid || msg.chat || msg.key?.remoteJid;

        const links = [
            // CATBOX (FUNCIONAN SIEMPRE)
            "https://files.catbox.moe/6f7ufo.jpeg",
            "https://files.catbox.moe/vvnn3r.jpeg",
            "https://files.catbox.moe/1t6rds.jpeg",

            // IBB LINKS (AÑADIDOS COMPLETOS)
            "https://i.ibb.co/HfsDTVhR.jpg",
            "https://i.ibb.co/N6Cn8t6Q.jpg",
            "https://i.ibb.co/xtB0rwYk.jpg",
            "https://i.ibb.co/Kj6z1x0f.jpg",
            "https://i.ibb.co/JFb1z7kp.jpg",
            "https://i.ibb.co/8g8Fk5HV.jpg",
            "https://i.ibb.co/hRgshtr4.jpg",
            "https://i.ibb.co/vvsxkmj2.jpg",
            "https://i.ibb.co/0RRYHnLH.jpg",
            "https://i.ibb.co/j05m01r.jpg",
            "https://i.ibb.co/XxpTQPyH.jpg",
            "https://i.ibb.co/c71YVLX.jpg",
            "https://i.ibb.co/ynSFYhvs.jpg",
            "https://i.ibb.co/fVgyYRdX.jpg",
            "https://i.ibb.co/Xr8QNqLf.jpg",
            "https://i.ibb.co/VcXgCXpz.jpg",
            "https://i.ibb.co/N2zy8Thy.jpg",
            "https://i.ibb.co/6R8YQRTM.jpg",
            "https://i.ibb.co/yBZT6TCh.jpg",
            "https://i.ibb.co/qF90Sx89.jpg",
            "https://i.ibb.co/XxSrCpm8.jpg",
            "https://i.ibb.co/MyPdKbTR.jpg",
            "https://i.ibb.co/Xh3y0mL.jpg",
            "https://i.ibb.co/Fq5Wj0zY.jpg",
            "https://i.ibb.co/WNgwjsqr.jpg",
            "https://i.ibb.co/BKvFLHNg.jpg",
            "https://i.ibb.co/7JYQ1WsS.jpg",
            "https://i.ibb.co/prfDkwwR.jpg",
            "https://i.ibb.co/PZ0Lp73Q.jpg",
            "https://i.ibb.co/0yKTk1wy.jpg",
            "https://i.ibb.co/prkbd5rP.jpg",
            "https://i.ibb.co/CFHYNqG.jpg",
            "https://i.ibb.co/HDSMRDG3.jpg",
            "https://i.ibb.co/dsZHz4M6.jpg",
            "https://i.ibb.co/k25GX8Gj.jpg",
            "https://i.ibb.co/tMJTYcWh.jpg",
            "https://i.ibb.co/pBnWbR84.jpg",
            "https://i.ibb.co/TBMV7qwm.jpg",
            "https://i.ibb.co/ZRPYXbsr.jpg",
            "https://i.ibb.co/7JNZHhxG.jpg",
            "https://i.ibb.co/fVLgv7vk.jpg",
            "https://i.ibb.co/4h96Nw5.jpg",
            "https://i.ibb.co/DgtRTXD3.jpg",
            "https://i.ibb.co/FkRqX9vw.jpg",
            "https://i.ibb.co/Z1JZnv0D.jpg",
            "https://i.ibb.co/Vhrc1tb.jpg",
            "https://i.ibb.co/QFxkb1zW.jpg",
            "https://i.ibb.co/vCXSG12q.jpg",
            "https://i.ibb.co/35rvy7hw.jpg",
            "https://i.ibb.co/DPBZh2BP.jpg",
            "https://i.ibb.co/fdb0cnHv.jpg",
            "https://i.ibb.co/ccsHkfzZ.jpg",
            "https://i.ibb.co/QvrWqV6b.jpg",
            "https://i.ibb.co/YVjvsZ4.jpg",
            "https://i.ibb.co/7dsWcxgf.jpg",
            "https://i.ibb.co/zT36L6X6.jpg",
            "https://i.ibb.co/RkTxSbHz.jpg",
            "https://i.ibb.co/JwVTnfTZ.jpg",
            "https://i.ibb.co/LDGpcnJC.jpg"
        ];

        const random = links[Math.floor(Math.random() * links.length)];

        const isVideo = random.endsWith(".mp4") || random.endsWith(".mov");

        await sock.sendMessage(
            jid,
            {
                [isVideo ? "video" : "image"]: { url: random },
                caption: "🍒 *tetas*"
            },
            { quoted: msg }
        );
    }
};