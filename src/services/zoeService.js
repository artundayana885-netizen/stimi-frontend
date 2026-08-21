export async function enviarMensajeZoe(identificador, mensaje) {
  const res = await fetch(import.meta.env.VITE_ZOE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificador, mensaje })
  });

  if (!res.ok) {
    throw new Error('Error al conectar con Zoe');
  }

  const data = await res.json();
  return data.mensaje;
}