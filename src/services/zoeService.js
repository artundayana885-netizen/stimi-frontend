import { leerRespuestaSegura } from './safeJson';

export async function enviarMensajeZoe(identificador, mensaje) {
  const res = await fetch(import.meta.env.VITE_ZOE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificador, mensaje })
  });

  if (!res.ok) {
    throw new Error(`Error al conectar con Zoe (HTTP ${res.status})`);
  }

  const data = await leerRespuestaSegura(res);
  return data.mensaje;
}