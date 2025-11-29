import axios from "axios";
import FormData from "form-data";

export default async function uploadImage(buffer) {
    try {
        let form = new FormData();
        form.append("file", buffer, "image.jpg");

        const res = await axios.post(
            "https://telegra.ph/upload",
            form,
            { headers: form.getHeaders() }
        );

        if (res.data && res.data[0] && res.data[0].src) {
            return "https://telegra.ph" + res.data[0].src;
        }

        return null;

    } catch (err) {
        console.error("❌ Error en uploadImage:", err);
        return null;
    }
}

