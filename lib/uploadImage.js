/**
 * Sube una imagen (Buffer) a telegra.ph
 * usando fetch + FormData nativos
 * Devuelve una URL pública
 */
export async function uploadImage(buffer) {
  const form = new FormData();

  form.append(
    "file",
    new Blob([buffer], { type: "image/jpeg" }),
    "image.jpg"
  );

  const res = await fetch("https://telegra.ph/upload", {
    method: "POST",
    body: form
  });

  if (!res.ok) {
    throw new Error("Error subiendo imagen");
  }

  const data = await res.json();

  if (!data || !data[0]?.src) {
    throw new Error("Respuesta inválida de telegra.ph");
  }

  return "https://telegra.ph" + data[0].src;
}
