import axios from "axios";

export default async function uploadFile(buffer) {
    try {
        const res = await axios.post(
            "https://api.lain.la/upload",
            buffer,
            {
                headers: {
                    "Content-Type": "application/octet-stream"
                }
            }
        );

        return res.data?.url || null;

    } catch (err) {
        console.error("❌ Error en uploadFile:", err);
        return null;
    }
}
