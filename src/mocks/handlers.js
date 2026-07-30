import { http, HttpResponse, delay } from 'msw';
import { reports, traceability, addReport, updateReportById, deleteReportById } from './db';

/**
 * Handlers que simulan el backend real mientras no está disponible.
 * Rutas y métodos HTTP tal como los pide el instructivo:
 *   GET    /api/reports                -> listado (usa Fetch API en el frontend)
 *   GET    /api/reports/:id            -> detalle (Axios)
 *   POST   /api/reports                -> crear (Axios)
 *   PUT    /api/reports/:id            -> actualizar (Axios)
 *   DELETE /api/reports/:id            -> eliminar (Axios)
 *   GET    /api/reports/:id/trazabilidad -> historial (Axios)
 */
export const handlers = [
  http.get('/api/reports', async ({ request }) => {
    await delay(500); // simula latencia real de red
    const url = new URL(request.url);
    const estado = url.searchParams.get('estado');
    const area = url.searchParams.get('area');
    let result = reports;
    if (estado && estado !== 'Todos') result = result.filter((r) => r.estado === estado);
    if (area && area !== 'Todas las áreas') result = result.filter((r) => r.area === area);
    return HttpResponse.json(result);
  }),

  http.get('/api/reports/:id', async ({ params }) => {
    await delay(400);
    const report = reports.find((r) => r.id === Number(params.id));
    if (!report) {
      return HttpResponse.json({ message: 'Informe no encontrado' }, { status: 404 });
    }
    return HttpResponse.json(report);
  }),

  http.post('/api/reports', async ({ request }) => {
    await delay(600);
    const body = await request.json();
    if (!body.instructor || !body.periodo || !body.fechaPresentacion) {
      return HttpResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const created = addReport(body);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put('/api/reports/:id', async ({ params, request }) => {
    await delay(600);
    const body = await request.json();
    const updated = updateReportById(params.id, body);
    if (!updated) {
      return HttpResponse.json({ message: 'Informe no encontrado' }, { status: 404 });
    }
    return HttpResponse.json(updated);
  }),

  http.delete('/api/reports/:id', async ({ params }) => {
    await delay(500);
    const existed = deleteReportById(params.id);
    if (!existed) {
      return HttpResponse.json({ message: 'Informe no encontrado' }, { status: 404 });
    }
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/reports/:id/trazabilidad', async ({ params }) => {
    await delay(400);
    const history = traceability[Number(params.id)];
    if (!history) {
      return HttpResponse.json({ message: 'Informe no encontrado' }, { status: 404 });
    }
    return HttpResponse.json(history);
  }),
];
