import apiClient from './apiClient';

/**
 * Mapea un objeto del Backend (entidad Informe de NestJS) al formato estructurado que espera la UI de React.
 */
function transformInformeToUi(backendInforme) {
  if (!backendInforme) return null;

  const id = backendInforme.id_informe;
  const type = backendInforme.tipologia || 'GC';
  const idVersion = backendInforme.version?.id_version || 1;
  const status = backendInforme.status || 'Pendiente';

  const isGc = type.toUpperCase() === 'GC';
  const isAprobado = status === 'Aprobado';
  const isACorregir = status === 'A Corregir';

  const color = isAprobado ? '#22c55e' : (isACorregir ? '#ef4444' : (isGc ? '#6366f1' : '#f97316'));
  const bg = isAprobado ? '#F0FDF4' : (isACorregir ? '#FEF2F2' : (isGc ? '#EEF2FF' : '#FFF7ED'));
  const initials = isGc ? 'GC' : 'GF';

  return {
    id,
    instructor: backendInforme.instructor || 'María González',
    type,
    month: backendInforme.date ? backendInforme.date : `Mes (Versión ${idVersion})`,
    status,
    date: backendInforme.date || new Date().toISOString().split('T')[0],
    initials,
    color,
    bg,
    fileName: backendInforme.fileName || `Informe_${type.toUpperCase()}_Version_${idVersion}.pdf`,
    fileType: 'pdf',
    filePages: 3,
    previewContent: [
      { label: 'Actividades realizadas', value: `Informe de actividades correspondiente a la tipología ${type}.` },
      { label: 'Horas impartidas', value: '80 horas' },
      { label: 'Versión del Formato', value: `Plantilla ID: ${idVersion}` },
      { label: 'Firma instructor', value: `${backendInforme.instructor || 'María González'} — C.C. 52.123.456` },
    ],
  };
}

/**
 * Mapea el payload del Frontend (UI) al DTO esperado por el Backend (CreateInformeDto / UpdateInformeDto).
 */
function transformUiToInforme(uiPayload) {
  return {
    tipologia: uiPayload.type || 'GC',
    id_version: uiPayload.id_version || 1,
    fileName: uiPayload.fileName,
    status: uiPayload.status || 'Pendiente',
    instructor: uiPayload.instructor,
    date: uiPayload.date,
  };
}

// GET /informe — listado de informes (con Axios y mapeo)
export async function getReports(params = {}) {
  const { data } = await apiClient.get('/informe', { params });
  return Array.isArray(data) ? data.map(transformInformeToUi) : [];
}

// GET /informe/:id — detalle de un informe
export async function getReportById(id) {
  const { data } = await apiClient.get(`/informe/${id}`);
  return transformInformeToUi(data);
}

// POST /informe — registrar un nuevo informe
export async function createReport(payload) {
  const backendDto = transformUiToInforme(payload);
  const { data } = await apiClient.post('/informe', backendDto);
  return transformInformeToUi(data);
}

// PATCH /informe/:id — actualizar un informe existente (NestJS usa PATCH para actualizaciones parciales)
export async function updateReport(id, payload) {
  const backendDto = transformUiToInforme(payload);
  const { data } = await apiClient.patch(`/informe/${id}`, backendDto);
  return transformInformeToUi(data);
}

// DELETE /informe/:id — eliminar un informe
export async function deleteReport(id) {
  const { data } = await apiClient.delete(`/informe/${id}`);
  return data;
}

// GET /informe/:id/trazabilidad — historial de estados/observaciones
// Si tu backend tiene esta ruta específica implementada en el módulo informe_gc, úsala. De lo contrario, cae a mock.
export async function getReportTraceability(id) {
  try {
    const { data } = await apiClient.get(`/informe_gc/trazabilidad/${id}`);
    return data;
  } catch {
    // Fallback estético para no romper la UI si no está implementada la trazabilidad en base de datos
    return [
      { id: 1, date: new Date().toISOString().split('T')[0], status: 'Pendiente', user: 'Sistema', observation: 'Informe registrado y pendiente de revisión.' }
    ];
  }
}

