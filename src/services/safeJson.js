// Lee la respuesta de un fetch de forma segura.
// Nunca truena con "Unexpected end of JSON input": si el body viene
// vacío o no es JSON válido, lanza un error claro y legible en vez
// del error críptico del navegador.
export async function leerRespuestaSegura(res) {
  const texto = await res.text();

  if (!texto || !texto.trim()) {
    throw new Error(
      'El servidor de automatización (n8n) respondió vacío. Verifica que el workflow esté activo y que el nodo "Respond to Webhook" se esté ejecutando.'
    );
  }

  try {
    return JSON.parse(texto);
  } catch {
    throw new Error(
      `El servidor de automatización no devolvió un JSON válido: ${texto.slice(0, 200)}`
    );
  }
}
