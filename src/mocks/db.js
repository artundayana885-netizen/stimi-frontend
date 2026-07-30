/**
 * "Base de datos" en memoria que simula el backend mientras el equipo de
 * desarrollo entrega la API REST real. La forma de los datos (campos,
 * nombres) sigue lo que pide el instructivo EA2:
 *   - Instructor contratista
 *   - Período del informe
 *   - Fecha de presentación
 *   - Estado del informe
 *   - Observaciones
 * y cada informe tiene su propia trazabilidad (historial de estados).
 *
 * Cuando llegue la API real, este archivo (y handlers.js) se eliminan y
 * services/reportsService.js apunta directo al backend: la interfaz no
 * necesita cambios porque solo consume las funciones de ese servicio.
 */

let nextId = 6;

export let reports = [
  {
    id: 1,
    instructor: 'María González',
    area: 'GEA',
    periodo: 'Junio 2026',
    fechaPresentacion: '2026-07-02',
    estado: 'Aprobado',
    observaciones: 'Informe completo, sin novedades.',
    createdAt: '2026-07-01',
  },
  {
    id: 2,
    instructor: 'Carlos Rodríguez',
    area: 'PAE',
    periodo: 'Junio 2026',
    fechaPresentacion: '2026-07-03',
    estado: 'En revisión',
    observaciones: 'Falta soporte de asistencia del 15 de junio.',
    createdAt: '2026-07-03',
  },
  {
    id: 3,
    instructor: 'Ana Martínez',
    area: 'TIC',
    periodo: 'Junio 2026',
    fechaPresentacion: '2026-07-01',
    estado: 'Pendiente',
    observaciones: '',
    createdAt: '2026-07-01',
  },
  {
    id: 4,
    instructor: 'Pedro Sánchez',
    area: 'Bioconstrucción',
    periodo: 'Mayo 2026',
    fechaPresentacion: '2026-06-05',
    estado: 'Rechazado',
    observaciones: 'El formato no corresponde al de la cuenta de cobro vigente.',
    createdAt: '2026-06-04',
  },
  {
    id: 5,
    instructor: 'Laura Torres',
    area: 'GEA',
    periodo: 'Junio 2026',
    fechaPresentacion: '2026-07-05',
    estado: 'Aprobado',
    observaciones: 'Todo en orden.',
    createdAt: '2026-07-04',
  },
];

export let traceability = {
  1: [
    { id: 1, fecha: '2026-07-01', estado: 'Pendiente', observacion: 'Informe registrado por el instructor.', responsable: 'María González' },
    { id: 2, fecha: '2026-07-02', estado: 'En revisión', observacion: 'Asignado para revisión del coordinador.', responsable: 'Coordinador' },
    { id: 3, fecha: '2026-07-02', estado: 'Aprobado', observacion: 'Cumple con todos los soportes requeridos.', responsable: 'Coordinador' },
  ],
  2: [
    { id: 1, fecha: '2026-07-03', estado: 'Pendiente', observacion: 'Informe registrado por el instructor.', responsable: 'Carlos Rodríguez' },
    { id: 2, fecha: '2026-07-03', estado: 'En revisión', observacion: 'Falta soporte de asistencia del 15 de junio.', responsable: 'Coordinador' },
  ],
  3: [
    { id: 1, fecha: '2026-07-01', estado: 'Pendiente', observacion: 'Informe registrado, en espera de revisión.', responsable: 'Ana Martínez' },
  ],
  4: [
    { id: 1, fecha: '2026-06-04', estado: 'Pendiente', observacion: 'Informe registrado por el instructor.', responsable: 'Pedro Sánchez' },
    { id: 2, fecha: '2026-06-05', estado: 'En revisión', observacion: 'Formato revisado por el coordinador.', responsable: 'Coordinador' },
    { id: 3, fecha: '2026-06-05', estado: 'Rechazado', observacion: 'El formato no corresponde al de la cuenta de cobro vigente.', responsable: 'Coordinador' },
  ],
  5: [
    { id: 1, fecha: '2026-07-04', estado: 'Pendiente', observacion: 'Informe registrado por el instructor.', responsable: 'Laura Torres' },
    { id: 2, fecha: '2026-07-05', estado: 'Aprobado', observacion: 'Todo en orden.', responsable: 'Coordinador' },
  ],
};

export function addReport(data) {
  const id = nextId++;
  const newReport = { id, createdAt: new Date().toISOString().slice(0, 10), ...data };
  reports = [newReport, ...reports];
  traceability[id] = [
    { id: 1, fecha: newReport.createdAt, estado: newReport.estado || 'Pendiente', observacion: 'Informe registrado.', responsable: newReport.instructor },
  ];
  return newReport;
}

export function updateReportById(id, changes) {
  const numId = Number(id);
  let updated = null;
  reports = reports.map((r) => {
    if (r.id === numId) {
      updated = { ...r, ...changes };
      return updated;
    }
    return r;
  });
  if (updated) {
    const history = traceability[numId] || [];
    traceability[numId] = [
      ...history,
      {
        id: history.length + 1,
        fecha: new Date().toISOString().slice(0, 10),
        estado: updated.estado,
        observacion: changes.observaciones || 'Información del informe actualizada.',
        responsable: 'Coordinador',
      },
    ];
  }
  return updated;
}

export function deleteReportById(id) {
  const numId = Number(id);
  const existed = reports.some((r) => r.id === numId);
  reports = reports.filter((r) => r.id !== numId);
  delete traceability[numId];
  return existed;
}
