import axios from "axios";
import FormData from "form-data";

/**
 * Sube una imagen (Buffer) a telegra.ph
 * y devuelve una URL pública
 */
export async function uploadImage(buffer) {
  const form = new FormData();
  form.append("file", buffer, {
    filename: "image.jpg"
  });

  const { data } = await axios.post(
    "https://telegra.ph/upload",
    form,
    { headers: form.getHeaders() }
  );

  if (!data || !data[0] || !data[0].src) {
    throw new Error("Error subiendo imagen");
  }

  return "https://telegra.ph" + data[0].src;
}
