/* ============================================================
   REGISTRO DE HISTORIAL — utilidad compartida.
   Cualquier componente del panel de coordinador puede importar
   addHistoryEntry() para dejar constancia de una acción. Todas
   quedan guardadas bajo la misma clave de localStorage y se
   reflejan en tiempo real en HistoryView.
   ============================================================ */

export const HISTORY_KEY = 'sena_history';
export const HISTORY_EVENT = 'sena-history-updated';

/**
 * Registra un movimiento del usuario en el historial.
 * kind: 'approved' | 'rejected' | 'system'  -> controla el color/ícono en HistoryView
 * type: etiqueta corta que se muestra como "chip" (ej: 'Perfil', 'Seguridad',
 *       'Notificaciones', 'Usuarios')
 */
export function addHistoryEntry({ action, detail, by, type = 'Sistema', kind = 'system' }) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const now = new Date();
    const entry = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      action,
      detail,
      by: by || 'Tú',
      type,
      kind,
      month: now.toLocaleDateString('es-CO', { month: 'long' }),
      date: now.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    };
    const updated = [entry, ...existing];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    // Avisa a cualquier HistoryView montado (misma pestaña) que hay un cambio.
    window.dispatchEvent(new Event(HISTORY_EVENT));
  } catch (err) {
    console.error('No se pudo registrar el movimiento en el historial', err);
  }
}

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}
