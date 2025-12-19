import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
    commands: ["checker", "check", "chacker"],
    category: "tools",

    async run(sock, msg, args, ctx) {
        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            const doc =
                quoted?.documentMessage ||
                msg.message?.documentMessage;

            if (!doc) {
                return sock.sendMessage(ctx.jid, {
                    text: "📄 *Responde a un archivo TXT o envíalo con el comando.*"
                });
            }

            // ⬇️ DESCARGA REAL DEL DOCUMENTO
            const stream = await downloadContentFromMessage(doc, "document");
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const text = buffer.toString("utf8");

            // ==============================
            // PROCESAMIENTO
            // ==============================
            const lines = text
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(Boolean);

            const results = [];

            for (const original of lines) {
                const digits = original.replace(/\D/g, "");
                if (digits.length < 6) continue;

                const count = {};
                for (const d of digits) {
                    count[d] = (count[d] || 0) + 1;
                }

                const maxRepeats = Math.max(...Object.values(count));

                if (maxRepeats >= 6) {
                    results.push({ original, maxRepeats });
                }
            }

            if (!results.length) {
                return sock.sendMessage(ctx.jid, {
                    text: "❌ No hay números con mínimo 6 dígitos repetidos."
                });
            }

            results.sort((a, b) => b.maxRepeats - a.maxRepeats);

            let out = "📊 *TOP 10 – NÚMEROS CON MÁS REPETIDOS*\n\n";

            for (const r of results.slice(0, 10)) {
                out += `🔹 ${r.original}\n`;
                out += `   ➤ Repeticiones máximas: *${r.maxRepeats}*\n\n`;
            }

            await sock.sendMessage(ctx.jid, { text: out });

        } catch (e) {
            console.error("CHECKER ERROR:", e);
            await sock.sendMessage(ctx.jid, {
                text: "❌ Error procesando el TXT."
            });
        }
    }
};
