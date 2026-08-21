import apiClient from './apiClient';

/* ============================================================================
   reportsService.js
   ----------------------------------------------------------------------------
   Capa de acceso a datos para informes (GC/GF) y revisión de evidencias.

   Endpoints reales del backend (confirmados en el log de arranque de Nest):
     GET   /informe            -> lista TODOS los informes (tabla `informe`)
     PATCH /informe/:id        -> actualiza un informe existente
     POST  /evidencias/revisar -> sube un PDF para revisión automática (n8n)

   La entidad `Informe` (TypeORM) solo tiene estas columnas reales:
     id_informe, tipologia, version, fileName, status, instructor, date,
     observacion, tipo_notificacion

   El frontend (ReportManagement.jsx, ReportFolders.jsx, UnitView.jsx) además
   espera campos puramente decorativos que NO existen en la base de datos:
     type, month, initials, color, bg, fileType, filePages, previewContent

   Por eso mapInforme() traduce cada fila del backend a un objeto "completo"
   para el frontend, calculando esos campos decorativos en el cliente.

   ⚠️ SUPUESTO A VERIFICAR
   ------------------------
   Asumo que la columna `tipologia` guarda exactamente el string 'GC' o 'GF'.
   Si en tu base de datos guarda otro valor, ajusta TYPE_STYLE y la función
   normalizeType() más abajo.
   ========================================================================= */

// ── Estilos institucionales por tipo de informe (decorativo, no viene del backend) ──
const TYPE_STYLE = {
  GC: { color: 'var(--sena-green)', bg: 'var(--sena-green-bg)' },
  GF: { color: 'var(--sena-blue)', bg: 'var(--sena-blue-bg)' },
};

function normalizeType(tipologia) {
  const t = String(tipologia || '').trim().toUpperCase();
  return t === 'GF' ? 'GF' : 'GC'; // por defecto GC si no coincide
}

function initialsFromName(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Traduce una fila cruda de la tabla `informe` al objeto que usan las
// pantallas de React (ReportManagement, ReportFolders, UnitView).
function mapInforme(raw) {
  if (!raw) return null;
  const type = normalizeType(raw.tipologia);
  const style = TYPE_STYLE[type];

  return {
    id: raw.id_informe,
    instructor: raw.instructor || 'Sin asignar',
    type,
    // `date` en el backend es un varchar libre (ej. '11/2024' o similar).
    // Se usa tanto como "month" (para agrupar en carpetas) como "date"
    // (para mostrar la fecha en la fila), porque el backend no separa ambos.
    month: raw.date,
    date: raw.date,
    status: raw.status || 'Pendiente',
    fileName: raw.fileName || `Informe_${type}_${raw.id_informe}.pdf`,
    observacion: raw.observacion || '',
    tipo_notificacion: raw.tipo_notificacion || '',

    // ── Campos decorativos, no existen en el backend ──
    initials: initialsFromName(raw.instructor),
    color: style.color,
    bg: style.bg,
    fileType: 'pdf',
    filePages: 1,
    previewContent: [],
  };
}

/**
 * Lista todos los informes (GC y GF) para el coordinador/instructor.
 * @returns {Promise<Array>} informes ya mapeados al formato del frontend
 */
export async function getReports() {
  const { data } = await apiClient.get('/informe');
  return (Array.isArray(data) ? data : []).map(mapInforme);
}

/**
 * Actualiza el estado/observación de un informe (aprobar o pedir corrección).
 * @param {number|string} id - id_informe
 * @param {{status?: string, observacion?: string, tipo_notificacion?: string, marcas?: Array}} payload
 * @returns {Promise<Object>} informe actualizado, ya mapeado
 *
 * Nota: `marcas` (las anotaciones hechas sobre el PDF en el visor) NO tiene
 * columna propia en el backend. El resumen de esas marcas ya se incluye como
 * texto dentro de `observacion` desde ReportManagement.jsx (handleCorrect),
 * así que aquí simplemente no se envía el arreglo crudo al backend.
 */
export async function updateReport(id, payload = {}) {
  const body = {};
  if (payload.status !== undefined) body.status = payload.status;
  if (payload.observacion !== undefined) body.observacion = payload.observacion;
  if (payload.tipo_notificacion !== undefined) body.tipo_notificacion = payload.tipo_notificacion;

  const { data } = await apiClient.patch(`/informe/${id}`, body);
  return mapInforme(data);
}

/**
 * Crea un nuevo informe (GC o GF) enviado por el instructor.
 * @param {{type: 'GC'|'GF', id_version?: number, fileName: string, status: string, instructor: string, date: string}} reportData
 * @returns {Promise<Object>} informe creado, ya mapeado
 *
 * ⚠️ Traduce `type` -> `tipologia`, porque así se llama la columna real en
 * la entidad `Informe` del backend (ver informe.entity.ts).
 */
export async function createReport(reportData = {}) {
  const { type, ...rest } = reportData;
  const body = {
    ...rest,
    tipologia: type,
  };
  const { data } = await apiClient.post('/informe', body);
  return mapInforme(data);
}

/**
 * Trae la trazabilidad (historial de estados/observaciones) de un informe.
 * @param {number|string} id - id_informe
 * @returns {Promise<Array<{status: string, observation: string}>>}
 *
 * ⚠️ PENDIENTE EN EL BACKEND: la ruta GET /informe/:id/trazabilidad NO
 * aparece en el log de arranque de Nest, así que probablemente no existe
 * todavía. Esta función queda lista para cuando se implemente; mientras
 * tanto, quien la llama (UnitView.jsx) ya captura el error y usa
 * `informe.observacion` como respaldo, así que no rompe nada.
 */
export async function getReportTraceability(id) {
  const { data } = await apiClient.get(`/informe/${id}/trazabilidad`);
  return data;
}

/**
 * Elimina un informe.
 * @param {number|string} id - id_informe
 * @returns {Promise<{message: string}>}
 */
export async function deleteReport(id) {
  const { data } = await apiClient.delete(`/informe/${id}`);
  return data;
}

/**
 * Sube un PDF de GC para revisión.
 * @param {File} archivo - el PDF seleccionado por el instructor
 * @param {string} identificador - cédula o id del instructor
 * @returns {Promise<{valido: boolean, mensaje: string, colaEstado?: string}>}
 */
export async function revisarGc(archivo, identificador) {
  const formData = new FormData();
  formData.append('documento', archivo);
  formData.append('identificador', identificador);

  // Importante: se anula el 'Content-Type: application/json' que trae apiClient
  // por defecto, para que el navegador genere el boundary correcto del multipart.
  const { data } = await apiClient.post('/evidencias/revisar', formData, {
    headers: { 'Content-Type': undefined },
  });

  // El interceptor de respuesta de apiClient ya convierte cualquier error HTTP
  // en un Error con mensaje legible, así que aquí solo devolvemos data en éxito.
  return data;
}