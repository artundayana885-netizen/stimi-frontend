import { useState, useEffect, useMemo, Component } from 'react';
import { useTheme } from '../../../ThemeContext';
import { getReports, deleteReport, getReportTraceability } from '../../../services/reportsService';
import jsPDF from 'jspdf';

const sena     = '#39A900';
const senaDeep = '#1F6B0A';
const amber    = '#B45309';
const amberBg  = '#FFFBEB';
const blueTxt  = '#1D4ED8';
const redTxt   = '#B91C1C';

// ── Colores del "visor de documento" — siempre iguales sin importar el
// tema de la app, igual que un lector de PDF real (papel blanco, marco
// oscuro). Coinciden con los que usa el coordinador al marcar errores.
const viewerChromeColor = '#00304D';
const viewerTrayColor   = '#11151B';
const markHighlightBg     = 'rgba(253,195,0,0.32)';
const markHighlightBorder = '#DDB400';
const markStrikeBg        = 'rgba(252,115,35,0.16)';
const markStrikeBorder    = '#FC7323';
const markStrikeLine      = '#FC7323';
const markPinBg           = '#00304D';

// ── Íconos de línea, consistentes en trazo y tamaño ─────────────────────
const Icon = {
  Target: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" />
    </svg>
  ),
  Star: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="currentColor" stroke="none">
      <path d="M12 2.5l2.9 6.3 6.8.7-5.1 4.6 1.5 6.7L12 17.3 5.9 20.8l1.5-6.7-5.1-4.6 6.8-.7L12 2.5Z" />
    </svg>
  ),
  Info: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-5" /><path d="M12 8h.01" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" />
    </svg>
  ),
  FileText: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  ClipboardList: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" /><path d="M9 12h6" /><path d="M9 16h6" />
    </svg>
  ),
};

// ── Anillo de progreso — la pieza distintiva de la cabecera ─────────────
function ProgressRing({ value, size = 108, stroke = 9, track, fill }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={fill} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .7s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}%</span>
        <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.75)', marginTop: 3, letterSpacing: '0.04em' }}>cumplido</span>
      </div>
    </div>
  );
}

// ── Meses, para poder ordenar cronológicamente el cumplimiento mensual.
// Soporta tanto "mm/aaaa" (ej. "10/2026") como "Nombre Año" (ej. "Octubre 2026").
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
function parseMonthKey(monthStr) {
  if (!monthStr) return { year: 0, idx: -1, name: monthStr || '' };
  const mmYyyy = monthStr.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYyyy) {
    const idx = parseInt(mmYyyy[1], 10) - 1;
    return { year: parseInt(mmYyyy[2], 10), idx, name: `${MONTH_NAMES[idx] || monthStr} ${mmYyyy[2]}` };
  }
  const nameYyyy = monthStr.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{4})$/);
  if (nameYyyy) {
    const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === nameYyyy[1].toLowerCase());
    return { year: parseInt(nameYyyy[2], 10), idx, name: monthStr };
  }
  return { year: 0, idx: -1, name: monthStr };
}

// ── Cuando un mes tiene varios informes (ej. GC y GF), mostramos el
// estado que más necesita atención del instructor, no un promedio.
const STATUS_PRIORITY = ['A Corregir', 'Pendiente', 'En Revisión', 'Aprobado'];
function aggregateStatus(statuses) {
  for (const s of STATUS_PRIORITY) if (statuses.includes(s)) return s;
  return 'Pendiente';
}

// ── Normaliza el nombre de estado que llega del backend a una de las 4
// categorías que la UI sabe representar. Así, si el backend manda
// "En Revisión", "en_revision", "EN REVISION", etc. lo reconocemos igual.
function normalizeStatus(status) {
  const s = (status || '').toString().trim().toLowerCase();
  if (s.includes('aprob')) return 'Aprobado';
  if (s.includes('corregir') || s.includes('correc')) return 'A Corregir';
  if (s.includes('revis')) return 'En Revisión';
  return 'Pendiente';
}

// ── Texto por defecto que se muestra en "Comentarios" mientras no haya
// (o no se pueda cargar) una observación real del revisor.
function defaultComment(normStatus) {
  switch (normStatus) {
    case 'Aprobado':
      return 'Aprobado sin observaciones';
    case 'A Corregir':
      return 'El revisor solicitó correcciones. Aún no hay una observación registrada en el sistema.';
    case 'En Revisión':
      return 'Tu informe está siendo revisado por coordinación.';
    default:
      return 'Tu informe fue recibido y está a la espera de que coordinación inicie la revisión.';
  }
}

// ── La observación que guarda el coordinador viene como un solo texto:
// la nota que escribió + un resumen de las marcas pegado al final
// ("\n\nMarcas señaladas en el documento:\n1. Página 1 — ..."). Como ya
// tenemos las marcas estructuradas en report.marcas, solo mostramos aquí
// la nota real y dejamos el resumen de marcas para una lista aparte,
// más legible.
function baseObservationText(observacion) {
  if (!observacion) return '';
  const marker = '\n\nMarcas señaladas en el documento:';
  const idx = observacion.indexOf(marker);
  return (idx >= 0 ? observacion.slice(0, idx) : observacion).trim();
}

// ── Marcas del documento (resaltado / tachón / comentario) — mismo
// vocabulario que usa el coordinador al revisar, para que las marcas que
// dejó se vean y se describan igual del lado del instructor.
function annotationLabel(a) {
  if (a.type === 'pin') return a.note ? `Comentario: "${a.note}"` : 'Comentario';
  if (a.type === 'strike') return 'Texto tachado';
  return 'Texto resaltado';
}

// ── Contenido genérico de página cuando no tenemos el detalle exacto que
// diligenció el instructor (el backend solo nos da tipo/mes/fecha).
function defaultPreviewContent(r) {
  return [
    { label: 'Actividades realizadas', value: `Informe de actividades correspondiente a la tipología ${r.type || ''}.` },
  ];
}

// ── Marca individual sobre la página, en modo SOLO LECTURA: no se puede
// arrastrar ni borrar, solo se puede pasar el mouse para leer la nota.
function ReadOnlyAnnotationMark({ index, ann }) {
  if (ann.type === 'pin') {
    return (
      <div
        title={ann.note || 'Comentario del revisor'}
        style={{ position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%, -50%)', zIndex: 15, cursor: 'help' }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: '50%', background: markPinBg, color: '#fff',
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)', border: '2px solid #fff',
        }}>{index}</div>
      </div>
    );
  }
  const isStrike = ann.type === 'strike';
  return (
    <div
      title={annotationLabel(ann)}
      style={{
        position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`, width: `${ann.w}%`, height: `${ann.h}%`,
        background: isStrike ? markStrikeBg : markHighlightBg,
        border: `1.5px solid ${isStrike ? markStrikeBorder : markHighlightBorder}`,
        borderRadius: 3, zIndex: 12, cursor: 'help',
      }}
    >
      {isStrike && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: markStrikeLine, transform: 'translateY(-50%)' }} />
      )}
      <span style={{
        position: 'absolute', top: -9, left: -9, width: 16, height: 16, borderRadius: '50%',
        background: isStrike ? markStrikeBorder : markHighlightBorder, color: '#fff', fontSize: 9, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}>{index}</span>
    </div>
  );
}

function ReadOnlyAnnotationLayer({ pageNum, annotations }) {
  const pageAnnotations = annotations.filter(a => a.page === pageNum);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {pageAnnotations.map((a) => (
        <div key={a.id || `${a.page}-${a.x}-${a.y}`} style={{ pointerEvents: 'auto', position: 'absolute', inset: 0 }}>
          <ReadOnlyAnnotationMark index={annotations.indexOf(a) + 1} ann={a} />
        </div>
      ))}
    </div>
  );
}

// ── Cuerpo de cada página del documento — misma plantilla que usa el
// coordinador al revisar, para que las marcas queden alineadas con lo que
// él vio y marcó.
function renderDocPageBody(pageNum, report) {
  switch (pageNum) {
    case 1:
      return (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Informe de Actividades — {report.month}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody>
              <tr style={{ background: '#F7F9FC' }}>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#374151', border: '1px solid #E8ECF0', width: '35%' }}>Instructor</td>
                <td style={{ padding: '8px 10px', color: '#111827', border: '1px solid #E8ECF0' }}>{report.instructor}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#374151', border: '1px solid #E8ECF0' }}>Tipo de Informe</td>
                <td style={{ padding: '8px 10px', color: '#111827', border: '1px solid #E8ECF0' }}>{report.type}</td>
              </tr>
              <tr style={{ background: '#F7F9FC' }}>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#374151', border: '1px solid #E8ECF0' }}>Período</td>
                <td style={{ padding: '8px 10px', color: '#111827', border: '1px solid #E8ECF0' }}>{report.month}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#374151', border: '1px solid #E8ECF0' }}>Fecha de envío</td>
                <td style={{ padding: '8px 10px', color: '#111827', border: '1px solid #E8ECF0' }}>{report.rawDate}</td>
              </tr>
              {report.previewContent.map((field, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#F7F9FC' : '#fff' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#374151', border: '1px solid #E8ECF0', verticalAlign: 'top' }}>{field.label}</td>
                  <td style={{ padding: '8px 10px', color: '#111827', border: '1px solid #E8ECF0', lineHeight: 1.5 }}>{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 2:
      return (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14, textAlign: 'center', textTransform: 'uppercase' }}>
            Evidencias y Soportes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {['Lista de asistencia firmada', 'Planeación pedagógica', 'Registro fotográfico', 'Evaluaciones aplicadas'].map((ev, i) => (
              <div key={i} style={{ background: '#EAF3E4', border: '1px solid #C9E3B8', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#007832', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.Check size={14} /> {ev}
              </div>
            ))}
          </div>
          <div style={{ background: '#F7F9FC', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#6B7280', lineHeight: 1.7, border: '1px solid #E8ECF0' }}>
            <strong style={{ color: '#374151' }}>Nota del instructor:</strong><br />
            Todos los documentos de soporte han sido adjuntados en la carpeta del mes correspondiente en el sistema SENA-Sofia Plus.
          </div>
        </div>
      );
    case 3:
      return (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14, textAlign: 'center', textTransform: 'uppercase' }}>
            Compromisos y Firma
          </div>
          <div style={{ background: '#FBF3D6', border: '1px solid #F0DE94', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#8A6D00', lineHeight: 1.7, marginBottom: 16 }}>
            Declaro que la información consignada en este informe es verídica y corresponde a las actividades desarrolladas durante el período indicado, de conformidad con el contrato de prestación de servicios N.° correspondiente.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 32 }}>
            {['Firma Instructor', 'Firma Coordinador'].map((label, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 120, height: 50, borderBottom: '1px solid #374151', marginBottom: 6 }}>
                  {i === 0 && <span style={{ fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' }}>Firmado digitalmente</span>}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 2 }}>
          {['Anexo 1: Cronograma de actividades', 'Anexo 2: Resultados de aprendizaje', 'Anexo 3: Registro de novedades'].map((a, i) => (
            <div key={i} style={{ padding: '8px 12px', background: i % 2 === 0 ? '#F7F9FC' : '#fff', borderRadius: 6, marginBottom: 4, border: '1px solid #E8ECF0' }}>{a}</div>
          ))}
        </div>
      );
  }
}

// ── Red de seguridad: si algo dentro del visor de documento lanza un
// error (datos con forma inesperada, etc.), en vez de dejar la pestaña
// completamente en blanco mostramos un aviso claro y el detalle técnico,
// para poder diagnosticarlo sin que la pantalla se quede vacía.
class DocumentViewerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Error al renderizar el visor de documento:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center', color: '#6B7280',
          background: '#F7F9FC', borderRadius: 8,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>No se pudo cargar el documento</div>
          <div style={{ fontSize: 12, maxWidth: 380 }}>
            Hubo un problema mostrando este informe. Intenta cerrar y volver a abrirlo; si sigue fallando, avísale a soporte con este detalle:
          </div>
          <code style={{ fontSize: 11, color: '#B91C1C', background: '#FEF2F2', padding: '6px 10px', borderRadius: 6, maxWidth: 380, overflowWrap: 'break-word' }}>
            {String(this.state.error?.message || this.state.error)}
          </code>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Visor de documento de solo lectura, con las mismas marcas
// (resaltado / tachón / comentario) que dejó el coordinador al revisar.
function ReadOnlyDocumentViewer({ report }) {
  // ── Blindaje: si filePages llega como algo que no sea un número
  // entero positivo (undefined, NaN, string no numérico, 0, negativo),
  // Array.from({ length }) puede lanzar un RangeError y tumbar todo el
  // árbol de React sin aviso, dejando la pestaña en blanco. Por eso
  // siempre normalizamos a un entero válido antes de generar las páginas.
  const rawPages = Number(report?.filePages);
  const totalPages = Number.isFinite(rawPages) && rawPages > 0 ? Math.floor(rawPages) : 1;
  const safeMarcas = Array.isArray(report?.marcas) ? report.marcas : [];
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: viewerChromeColor, borderRadius: '10px 10px 0 0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.FileText size={16} />
          <span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.fileName || report.name}
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{totalPages} página{totalPages === 1 ? '' : 's'}</span>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', background: viewerTrayColor,
        padding: 16, borderRadius: '0 0 10px 10px', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {pages.map((pageNum) => (
          <div key={pageNum} style={{
            position: 'relative', background: '#fff', borderRadius: 8, padding: '32px 28px', minHeight: 400,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontFamily: "'Times New Roman', serif",
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #111827' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1, textTransform: 'uppercase' }}>
                Servicio Nacional de Aprendizaje — SENA
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Sistema de Información y Trazabilidad del Instructor</div>
              <div style={{ marginTop: 10, display: 'inline-block', background: report.type === 'GC' ? '#EAF3E4' : '#E7EEF2', color: report.type === 'GC' ? '#007832' : '#00304D', padding: '3px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                INFORME {report.type} — {(report.month || '').toString().toUpperCase()}
              </div>
            </div>

            {renderDocPageBody(pageNum, report)}

            <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #E8ECF0', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
              <span>SENA — SITMI</span>
              <span>Página {pageNum} de {totalPages}</span>
              <span>{report.rawDate}</span>
            </div>

            <ReadOnlyAnnotationLayer pageNum={pageNum} annotations={safeMarcas} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UnitView({ userName }) {
  const { colors, theme } = useTheme();
  const [dbReports, setDbReports] = useState([]);

  // ── Fechas importantes: ahora inicia vacío. Agrega las tuyas desde la
  // sección correspondiente (o cárgalas manualmente en localStorage
  // bajo la clave 'sena_dates').
  const [datesList, setDatesList] = useState([]);

  const [showAllReports, setShowAllReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalTab, setModalTab] = useState('doc'); // 'doc' | 'info'
  const [toast, setToast] = useState(null);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

  // ── Observación real del revisor para el informe abierto en el modal.
  // Se carga desde /informe/:id/trazabilidad al abrir el modal.
  const [reportObservation, setReportObservation] = useState('');
  const [loadingObservation, setLoadingObservation] = useState(false);

  // IDs eliminados (mock + reales). Se persiste en localStorage para que
  // los informes de ejemplo no reaparezcan al recargar la página.
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('sena_deleted_reports') || '[]'));
    } catch (e) {
      return new Set();
    }
  });

  const persistDeletedIds = (nextSet) => {
    try {
      localStorage.setItem('sena_deleted_reports', JSON.stringify([...nextSet]));
    } catch (e) {
      console.error(e);
    }
  };

  const markDeleted = (id) => {
    setDeletedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      persistDeletedIds(next);
      return next;
    });
  };

  const loadReports = async () => {
    try {
      let currentUserName = '';
      try {
        const savedUser = localStorage.getItem('sena_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          currentUserName = parsed.name || '';
        }
      } catch (e) {
        console.error(e);
      }

      const data = await getReports();
      const filtered = currentUserName
        ? data.filter(r => r.instructor === currentUserName)
        : data;
      setDbReports(filtered || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReports();
    const savedDates = JSON.parse(localStorage.getItem('sena_dates') || '[]');
    if (savedDates.length > 0) {
      setDatesList(savedDates);
    }
  }, []);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Abre el modal de un informe en la pestaña indicada. Antes había un
  // useEffect que reseteaba modalTab a 'doc' cada vez que cambiaba
  // selectedReport, así que el botón "Detalles" abría el modal pero
  // siempre te dejaba viendo el visor de documento en vez de la pestaña
  // de Detalles. Ahora el tab se decide explícitamente al abrir.
  const openReportModal = (report, tab = 'doc') => {
    setSelectedReport(report);
    setModalTab(tab);
  };

  // ── Cuando se abre el modal de un informe, trae su trazabilidad real
  // y toma la observación más reciente (idealmente la que corresponde
  // al estado actual, por ejemplo la última vez que lo mandaron "A
  // Corregir" o "En Revisión").
  useEffect(() => {
    let ignore = false;

    async function loadObservation() {
      if (!selectedReport) {
        setReportObservation('');
        return;
      }
      setLoadingObservation(true);
      try {
        const trace = await getReportTraceability(selectedReport.id);
        if (ignore) return;

        if (Array.isArray(trace) && trace.length > 0) {
          const normTarget = normalizeStatus(selectedReport.status);
          // Buscamos, de más reciente a más antiguo, la entrada que
          // corresponda al estado actual del informe.
          const matching = [...trace].reverse().find(
            (t) => normalizeStatus(t.status) === normTarget
          );
          const latest = matching || trace[trace.length - 1];
          setReportObservation((latest && latest.observation) || '');
        } else {
          setReportObservation('');
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setReportObservation('');
      } finally {
        if (!ignore) setLoadingObservation(false);
      }
    }

    loadObservation();
    return () => { ignore = true; };
  }, [selectedReport?.id, selectedReport?.status]);

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 960;

  const showToast = (msg, color = senaDeep) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

  const eyebrow = { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: colors.textFaint };

  // ── Paleta de estado: cada estado tiene su propio color, ya no se
  // agrupa todo lo que no es "Aprobado" bajo el mismo naranja.
  const statusPalette = {
    green:  { bg: theme === 'dark' ? 'rgba(22,163,74,0.16)'  : '#EAF7E4', text: senaDeep, border: theme === 'dark' ? 'rgba(22,163,74,0.3)'  : '#CFEFC2', shadow: 'rgba(57,169,0,0.15)' },
    blue:   { bg: theme === 'dark' ? 'rgba(29,78,216,0.16)'  : '#EAF1FE', text: blueTxt,  border: theme === 'dark' ? 'rgba(29,78,216,0.3)'  : '#C7D9FB', shadow: 'rgba(29,78,216,0.15)' },
    red:    { bg: theme === 'dark' ? 'rgba(185,28,28,0.16)'  : '#FEF2F2', text: redTxt,   border: theme === 'dark' ? 'rgba(185,28,28,0.3)'  : '#FBD1D1', shadow: 'rgba(185,28,28,0.15)' },
    orange: { bg: theme === 'dark' ? 'rgba(180,83,9,0.18)'   : '#FEF3E2', text: amber,    border: theme === 'dark' ? 'rgba(180,83,9,0.35)'  : '#FCE0B4', shadow: 'rgba(180,83,9,0.15)' },
  };

  const S = {
    card: {
      background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, overflow: 'hidden',
      boxShadow: theme === 'dark'
        ? '0 8px 24px rgba(0,0,0,0.35), 0 2px 8px rgba(57,169,0,0.08)'
        : '0 10px 26px -6px rgba(57,169,0,0.13), 0 2px 8px rgba(180,83,9,0.05)',
    },
    badge: (color) => {
      const p = statusPalette[color] || statusPalette.orange;
      return {
        padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
        background: p.bg, color: p.text, border: `1px solid ${p.border}`,
        boxShadow: `0 2px 8px ${p.shadow}`,
      };
    },
  };

  // ── Tarjetas de indicadores: valores en cero, listos para conectarse
  // a datos reales cuando existan informes.
  const scorecards = [
    { label: 'Informes Aprobados', value: `${dbReports.filter(r => normalizeStatus(r.status) === 'Aprobado').length}/12`, delta: '', up: true,  IconEl: Icon.Check },
    { label: 'Entregas a Tiempo',  value: `${dbReports.length}/12`, delta: '', up: true,  IconEl: Icon.Clock },
    { label: 'Promedio Calidad',   value: '—', delta: '', up: true, IconEl: Icon.Star },
  ];

  // ── Color de badge por estado normalizado.
  function colorForStatus(normStatus) {
    switch (normStatus) {
      case 'Aprobado': return 'green';
      case 'A Corregir': return 'red';
      case 'En Revisión': return 'blue';
      default: return 'orange'; // Pendiente
    }
  }

  // ── Informes de ejemplo eliminados. Ahora solo se muestran los
  // informes reales que existan en la base de datos.
  const mappedDb = dbReports.map(r => {
    const normStatus = normalizeStatus(r.status);
    const marcas = Array.isArray(r.marcas) ? r.marcas : [];
    const maxMarkPage = marcas.length ? Math.max(...marcas.map(m => Number(m.page) || 1)) : 1;
    const rawFilePages = Number(r.filePages);
    const basePages = Number.isFinite(rawFilePages) && rawFilePages > 0 ? rawFilePages : 3;
    const filePages = Math.max(basePages, maxMarkPage, 1);
    return {
      id: r.id,
      name: `Informe ${r.type.toUpperCase()} - ${r.month}`,
      status: r.status || 'Pendiente',
      sentDate: r.date,
      reviewedDate: normStatus !== 'Pendiente' ? r.date : '—',
      color: colorForStatus(normStatus),
      reviewer: r.type === 'GC' ? 'Coordinador Académico' : 'Coordinador Financiero',
      size: '1.5 MB',
      // Observación real que dejó el revisor, tal como viene guardada en
      // el propio informe (columna `observacion` en el backend). Esta es
      // la fuente principal — no depende de la ruta de trazabilidad, que
      // puede no estar implementada.
      observacion: r.observacion || '',
      // Texto por defecto; solo se usa si no hay ninguna observación real
      // guardada todavía.
      comments: defaultComment(normStatus),
      fileName: r.fileName,
      // ── Datos para el visor de documento y la descarga con marcas ──
      type: r.type,
      month: r.month,
      instructor: r.instructor,
      rawDate: r.date,
      marcas,
      filePages,
      previewContent: defaultPreviewContent(r),
    };
  });

  const displayReports = mappedDb.filter(r => !deletedIds.has(r.id));

  const reports = showAllReports ? displayReports : displayReports.slice(0, 4);

  // ── Historial por mes: en vez de un % (poco útil cuando hay 1-2
  // informes por mes), mostramos el estado que más necesita atención de
  // cada mes con actividad — así el instructor ve de un vistazo dónde
  // tiene algo pendiente o por corregir.
  const monthly = useMemo(() => {
    const byMonth = {};
    dbReports.forEach(r => {
      const key = r.month || 'Sin mes';
      if (!byMonth[key]) byMonth[key] = { key, statuses: [] };
      byMonth[key].statuses.push(normalizeStatus(r.status));
    });

    const entries = Object.values(byMonth).map(m => {
      const parsed = parseMonthKey(m.key);
      return { label: parsed.name, status: aggregateStatus(m.statuses), year: parsed.year, idx: parsed.idx };
    }).sort((a, b) => (a.year - b.year) || (a.idx - b.idx));

    const last6 = entries.slice(-6);
    const now = new Date();
    const currentMatch = last6.findIndex(e => e.year === now.getFullYear() && e.idx === now.getMonth());
    const currentIdx = currentMatch >= 0 ? currentMatch : last6.length - 1;
    return last6.map((e, i) => ({ ...e, current: i === currentIdx }));
  }, [dbReports]);

  // ── Próxima fecha límite: la plataforma recibe informes del 1 al 28 de
  // cada mes (ver el aviso de arriba), así que calculamos cuántos días
  // faltan para ese cierre.
  const nextDeadline = useMemo(() => {
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), 28);
    if (now.getDate() > 28) target = new Date(now.getFullYear(), now.getMonth() + 1, 28);
    const diffDays = Math.ceil((target - now) / 86400000);
    return { diffDays, label: `28 de ${MONTH_NAMES[target.getMonth()]}` };
  }, []);

  const rowBg = theme === 'dark' ? colors.bgAlt : '#FAFBF9';
  const urgentBorder = theme === 'dark' ? 'rgba(180,83,9,0.4)' : '#F4D9AE';

  // ── Genera un PDF real del informe, dibujando cada página con el mismo
  // contenido que ve el coordinador y superponiendo las marcas
  // (resaltados, tachones y comentarios numerados) que él dejó. Así la
  // descarga incluye "los tachones y todo", no solo el texto plano.
  const generateAnnotatedPdf = (report) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    const TEXT = [17, 24, 39];
    const MUTED = [107, 114, 128];
    const GREEN = [0, 120, 50];
    const BLUE = [0, 48, 77];
    const GOLD_FILL = [253, 241, 179];
    const GOLD_LINE = [221, 180, 0];
    const ORANGE_FILL = [255, 224, 199];
    const ORANGE_LINE = [252, 115, 35];

    const totalPages = report.filePages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (pageNum > 1) doc.addPage();

      // Encabezado tipo "papel" del informe
      doc.setDrawColor(17, 24, 39);
      doc.setLineWidth(1.2);
      doc.line(margin, margin + 48, pageWidth - margin, margin + 48);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...TEXT);
      doc.text('SERVICIO NACIONAL DE APRENDIZAJE — SENA', pageWidth / 2, margin + 12, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text('Sistema de Información y Trazabilidad del Instructor', pageWidth / 2, margin + 26, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...(report.type === 'GC' ? GREEN : BLUE));
      doc.text(`INFORME ${report.type} — ${(report.month || '').toString().toUpperCase()}`, pageWidth / 2, margin + 40, { align: 'center' });

      // Cuerpo simplificado de la página (tabla de datos en la página 1)
      let y = margin + 76;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...TEXT);
      doc.text(`Página ${pageNum} de ${totalPages}`, margin, y);
      y += 20;

      if (pageNum === 1) {
        const rows = [
          ['Instructor', report.instructor || ''],
          ['Tipo de Informe', report.type || ''],
          ['Período', report.month || ''],
          ['Fecha de envío', report.rawDate || ''],
          ...report.previewContent.map(f => [f.label, f.value]),
        ];
        doc.setFontSize(9);
        rows.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...TEXT);
          doc.text(String(label), margin, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...MUTED);
          const wrapped = doc.splitTextToSize(String(value), pageWidth - margin * 2 - 150);
          doc.text(wrapped, margin + 150, y);
          y += 16 * Math.max(1, wrapped.length);
        });
      } else if (pageNum === 2) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        ['Lista de asistencia firmada', 'Planeación pedagógica', 'Registro fotográfico', 'Evaluaciones aplicadas'].forEach(ev => {
          doc.text(`• ${ev}`, margin, y);
          y += 16;
        });
      } else if (pageNum === 3) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        const decl = doc.splitTextToSize(
          'Declaro que la información consignada en este informe es verídica y corresponde a las actividades desarrolladas durante el período indicado.',
          pageWidth - margin * 2
        );
        doc.text(decl, margin, y);
      }

      // ── Marcas del revisor sobre esta página ──
      const pageMarks = report.marcas.filter(m => m.page === pageNum);
      pageMarks.forEach((m) => {
        const idx = report.marcas.indexOf(m) + 1;
        const rx = (m.x / 100) * pageWidth;
        const ry = (m.y / 100) * pageHeight;

        if (m.type === 'pin') {
          doc.setFillColor(0, 48, 77);
          doc.circle(rx, ry, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text(String(idx), rx, ry + 2.8, { align: 'center' });
          return;
        }

        const rw = (m.w / 100) * pageWidth;
        const rh = (m.h / 100) * pageHeight;
        const isStrike = m.type === 'strike';
        doc.setFillColor(...(isStrike ? ORANGE_FILL : GOLD_FILL));
        doc.setDrawColor(...(isStrike ? ORANGE_LINE : GOLD_LINE));
        doc.setLineWidth(1);
        doc.roundedRect(rx, ry, rw, rh, 2, 2, 'FD');
        if (isStrike) {
          doc.setDrawColor(...ORANGE_LINE);
          doc.setLineWidth(1.4);
          doc.line(rx, ry + rh / 2, rx + rw, ry + rh / 2);
        }
        doc.setFillColor(...(isStrike ? ORANGE_LINE : GOLD_LINE));
        doc.circle(rx, ry, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(String(idx), rx, ry + 2.4, { align: 'center' });
      });

      // Pie de página
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('SENA — SITMI', margin, pageHeight - 24);
      doc.text(report.rawDate || '', pageWidth - margin, pageHeight - 24, { align: 'right' });
    }

    // ── Página final con el listado de observaciones/marcas del revisor ──
    if (report.marcas.length > 0 || report.observacion) {
      doc.addPage();
      let y = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...TEXT);
      doc.text('Observaciones del revisor', margin, y);
      y += 24;

      if (report.observacion) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...MUTED);
        const obsLines = doc.splitTextToSize(report.observacion, pageWidth - margin * 2);
        doc.text(obsLines, margin, y);
        y += obsLines.length * 13 + 16;
      }

      if (report.marcas.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...TEXT);
        doc.text('Marcas señaladas en el documento', margin, y);
        y += 18;

        report.marcas.forEach((m, i) => {
          const isStrike = m.type === 'strike';
          const dotColor = m.type === 'pin' ? [0, 48, 77] : (isStrike ? ORANGE_LINE : GOLD_LINE);
          doc.setFillColor(...dotColor);
          doc.circle(margin + 6, y - 3, 6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(255, 255, 255);
          doc.text(String(i + 1), margin + 6, y - 0.5, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...MUTED);
          doc.text(`Página ${m.page} — ${annotationLabel(m)}`, margin + 20, y);
          y += 16;
        });
      }
    }

    doc.save(`${(report.fileName || report.name || 'informe').replace(/\.[^.]+$/, '')}_corregido.pdf`);
  };

  const handleDownload = (r) => {
    showToast(`✓ Descargando "${r.fileName || r.name}"...`);
    try {
      generateAnnotatedPdf(r);
    } catch (err) {
      console.error(err);
      showToast('Error al generar el PDF', '#ef4444');
    }
  };

  const handleDelete = async (r) => {
    try {
      await deleteReport(r.id);
      markDeleted(r.id); // lo oculta de inmediato, sin esperar el refresh
      showToast(`✓ Eliminado "${r.fileName || r.name}"`);
      loadReports(); // sincroniza con la BD en segundo plano

      // Agregar al historial local
      const hist = JSON.parse(localStorage.getItem('sena_history') || '[]');
      hist.push({
        action: 'Eliminación',
        detail: `Instructor eliminó informe ${r.fileName || r.name}`,
        date: new Date().toLocaleDateString('es-CO'),
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem('sena_history', JSON.stringify(hist));
    } catch (err) {
      showToast(`Error al eliminar: ${err.message}`, '#ef4444');
      return; // si falló, no cerramos el modal ni tocamos nada más
    }

    // Si el modal de detalles tenía abierto este informe, se cierra solo.
    setSelectedReport(prev => (prev && prev.id === r.id ? null : prev));
  };

  const ActionButton = ({ title, onClick, children, danger = false }) => (
    <button
      title={title}
      aria-label={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        width: 30, height: 30, borderRadius: 8, border: `1px solid ${colors.border}`,
        background: 'transparent', color: colors.textFaint, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'all .15s',
      }}
      onMouseEnter={e => {
        if (danger) {
          e.currentTarget.style.background = theme === 'dark' ? 'rgba(239,68,68,0.14)' : '#FEF2F2';
          e.currentTarget.style.color = '#DC2626';
          e.currentTarget.style.borderColor = '#EF4444';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(239,68,68,0.28)';
        } else {
          e.currentTarget.style.background = theme === 'dark' ? 'rgba(57,169,0,0.12)' : '#F0FDF4';
          e.currentTarget.style.color = senaDeep;
          e.currentTarget.style.borderColor = sena;
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(57,169,0,0.22)';
        }
      }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textFaint; e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {children}
    </button>
  );

  const IconDownload = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" />
    </svg>
  );
  const IconInfo = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-5" /><path d="M12 8h.01" />
    </svg>
  );
  const IconTrash = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text, minHeight: '100%', padding: isMobile ? '0 2px' : 0 }}>

      {toast && (
        <div style={{ position: 'fixed', top: isMobile ? 12 : 24, right: isMobile ? 12 : 24, left: isMobile ? 12 : 'auto', zIndex: 2000, background: colors.card, color: colors.text, padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,0.18)', border: `1px solid ${colors.border}`, borderLeft: `3px solid ${sena}` }}>
          {toast.msg}
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedReport && (
        <div
          onClick={() => setSelectedReport(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,15,0.5)', zIndex: 3000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: colors.card, borderRadius: isMobile ? '18px 18px 0 0' : 16, padding: 0, width: '100%', maxWidth: isMobile ? '100%' : 620, maxHeight: isMobile ? '92vh' : '88vh', height: isMobile ? '92vh' : 640, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${colors.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.28)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: isMobile ? '20px 22px 0' : '24px 28px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: theme === 'dark' ? 'rgba(57,169,0,0.12)' : '#EEF9E7', border: `1px solid ${theme === 'dark' ? 'rgba(57,169,0,0.3)' : '#D6F0C4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: senaDeep, boxShadow: '0 4px 10px rgba(57,169,0,0.16)' }}><Icon.FileText /></div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{selectedReport.name}</div>
                  <span style={S.badge(selectedReport.color)}>{selectedReport.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => handleDownload(selectedReport)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9,
                    border: 'none', background: `linear-gradient(135deg, ${sena}, ${senaDeep})`, color: '#fff',
                    fontWeight: 700, fontSize: 12.5, cursor: 'pointer', boxShadow: '0 4px 12px rgba(57,169,0,0.35)',
                  }}
                >
                  <IconDownload /> Descargar
                </button>
                <button onClick={() => setSelectedReport(null)} style={{ border: 'none', background: theme === 'dark' ? colors.bgAlt : '#F3F4F6', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: colors.textFaint, fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
              </div>
            </div>

            {/* Tabs: Ver Documento / Detalles & Acción */}
            <div style={{ display: 'flex', gap: 4, padding: `0 ${isMobile ? 22 : 28}px`, borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
              {[
                { key: 'doc', label: 'Ver Documento', Icon: Icon.FileText },
                { key: 'info', label: 'Detalles', Icon: Icon.ClipboardList },
              ].map(t => (
                <button key={t.key} onClick={() => setModalTab(t.key)} style={{
                  padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: modalTab === t.key ? 700 : 500,
                  color: modalTab === t.key ? senaDeep : colors.textFaint,
                  borderBottom: modalTab === t.key ? `2px solid ${sena}` : '2px solid transparent',
                  marginBottom: -1, display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <t.Icon size={14} /> {t.label}
                  {t.key === 'doc' && selectedReport.marcas.length > 0 && (
                    <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: amberBg, color: amber }}>{selectedReport.marcas.length}</span>
                  )}
                </button>
              ))}
            </div>

            {modalTab === 'doc' ? (
              <div style={{ flex: 1, minHeight: 0, padding: isMobile ? '14px 16px' : '16px 20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderRadius: 10, border: `1px solid ${colors.border}`, flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <DocumentViewerErrorBoundary key={selectedReport.id}>
                    <ReadOnlyDocumentViewer report={selectedReport} />
                  </DocumentViewerErrorBoundary>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: isMobile ? '18px 22px 22px' : '20px 28px 26px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 20, border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  {[
                    { label: 'Fecha de envío',     value: selectedReport.sentDate },
                    { label: 'Fecha de revisión',  value: selectedReport.reviewedDate },
                    { label: 'Revisado por',       value: selectedReport.reviewer },
                    { label: 'Tamaño del archivo', value: selectedReport.size },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: i % 2 ? rowBg : 'transparent', borderTop: i ? `1px solid ${colors.border}` : 'none' }}>
                      <span style={{ fontSize: 12.5, color: colors.textFaint }}>{item.label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 22 }}>
                  <div style={{ ...eyebrow, marginBottom: 7 }}>Comentarios del revisor</div>
                  <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.55, padding: '11px 14px', borderRadius: 10, background: rowBg, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${sena}` }}>
                    {loadingObservation
                      ? 'Cargando observaciones...'
                      : (baseObservationText(selectedReport.observacion || reportObservation) || selectedReport.comments)}
                  </div>
                </div>

                {selectedReport.marcas.length > 0 && (
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ ...eyebrow, marginBottom: 7 }}>Marcas señaladas en el documento ({selectedReport.marcas.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedReport.marcas.map((m, i) => (
                        <div key={m.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: colors.textSecondary, padding: '9px 12px', borderRadius: 9, background: rowBg, border: `1px solid ${colors.border}` }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                            background: m.type === 'pin' ? markPinBg : (m.type === 'strike' ? markStrikeBorder : markHighlightBorder),
                            color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>{i + 1}</span>
                          <span>Página {m.page} — {annotationLabel(m)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 8 }}>
                      Ábrelas en la pestaña "Ver Documento" para verlas marcadas directamente sobre el informe.
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedReport(null)}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 9, border: `1.5px solid ${colors.borderStrong}`, background: 'transparent', color: colors.textSecondary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header — el anillo de cumplimiento es la pieza central, no una tarjeta más */}
      <div style={{
        background: `linear-gradient(160deg, ${senaDeep} 0%, #163F0A 100%)`, borderRadius: 18, padding: isMobile ? '22px 20px' : '28px 32px', marginBottom: 20, color: '#fff',
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 18 : 24,
        flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', position: 'relative', overflow: 'hidden',
        border: `1px solid rgba(143,224,92,0.25)`,
        boxShadow: '0 18px 40px -12px rgba(57,169,0,0.45), 0 8px 24px -8px rgba(180,83,9,0.2)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: 40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,224,92,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -70, left: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8FE05C', display: 'inline-block', boxShadow: '0 0 8px 2px rgba(143,224,92,0.7)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', opacity: 0.75 }}>Panel de Control</span>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: isMobile ? 22 : 27, fontWeight: 700, letterSpacing: '-0.4px' }}>Mi Cumplimiento</h2>
          <p style={{ margin: 0, fontSize: 13.5, opacity: 0.72, maxWidth: 360 }}>Seguimiento de tus informes mensuales y desempeño frente a coordinación.</p>
        </div>
        <div style={{ position: isMobile ? 'relative' : 'relative', alignSelf: isMobile ? 'center' : 'auto', zIndex: 1, filter: 'drop-shadow(0 6px 18px rgba(143,224,92,0.4))' }}>
          <ProgressRing value={0} size={isMobile ? 88 : 108} stroke={isMobile ? 8 : 9} track="rgba(255,255,255,0.18)" fill="#8FE05C" />
        </div>
      </div>

      {/* Franja de indicadores — una sola tarjeta dividida, no cuatro repetidas */}
      <div style={{ ...S.card, display: 'flex', flexDirection: isMobile ? 'column' : 'row', marginBottom: 20 }}>
        {scorecards.map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: isMobile ? '14px 18px' : '18px 22px',
            borderLeft: (!isMobile && i) ? `1px solid ${colors.border}` : 'none',
            borderTop: (isMobile && i) ? `1px solid ${colors.border}` : 'none',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: theme === 'dark' ? 'rgba(57,169,0,0.12)' : '#EEF9E7',
              border: `1px solid ${theme === 'dark' ? 'rgba(57,169,0,0.3)' : '#D6F0C4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: senaDeep, flexShrink: 0, boxShadow: '0 4px 10px rgba(57,169,0,0.18)',
            }}>
              <s.IconEl size={17} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: colors.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: colors.textFaint, marginTop: 2, whiteSpace: 'nowrap' }}>{s.label}</div>
              {s.delta && <div style={{ fontSize: 10.5, color: senaDeep, fontWeight: 600, marginTop: 3 }}>{s.delta}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Alert */}
      <div style={{ ...S.card, background: theme === 'dark' ? 'linear-gradient(135deg, rgba(57,169,0,0.08), rgba(180,83,9,0.05))' : 'linear-gradient(135deg, #F3FBEE, #FFFAF0)', marginBottom: 20, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `3px solid ${sena}` }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: theme === 'dark' ? 'rgba(57,169,0,0.14)' : '#fff', border: `1px solid ${theme === 'dark' ? 'rgba(57,169,0,0.3)' : '#D6F0C4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: senaDeep, flexShrink: 0, marginTop: 1, boxShadow: '0 4px 10px rgba(57,169,0,0.16)' }}><Icon.Info size={17} /></div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Período de carga de informes</div>
          <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.55 }}>La plataforma estará habilitada para subir informes del <strong>1 al 28 de cada mes</strong>. Asegúrate de entregar tus informes a tiempo.</div>
        </div>
      </div>

      {/* Row 1: Informes Recientes + Fechas Importantes */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ ...S.card, padding: isMobile ? '18px' : '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Informes Recientes</div>
              <div style={eyebrow}>Últimos entregados</div>
            </div>
            <button
              onClick={() => setShowAllReports(v => !v)}
              style={{ padding: '6px 2px', border: 'none', background: 'transparent', color: senaDeep, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {showAllReports ? 'Ver menos' : 'Ver todos'}
              <span style={{ display: 'inline-block', transition: 'transform .2s ease', transform: showAllReports ? 'rotate(90deg)' : 'rotate(0deg)' }}>→</span>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {reports.length === 0 && (
              <div style={{ padding: '24px 4px', textAlign: 'center', fontSize: 12.5, color: colors.textFaint }}>
                No hay informes para mostrar.
              </div>
            )}
            {reports.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', alignItems: 'center', gap: isMobile ? 10 : 14, padding: '13px 4px', borderTop: i ? `1px solid ${colors.border}` : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: theme === 'dark' ? 'rgba(57,169,0,0.1)' : '#EEF9E7', border: `1px solid ${theme === 'dark' ? 'rgba(57,169,0,0.28)' : '#D6F0C4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: senaDeep, flexShrink: 0, boxShadow: '0 3px 8px rgba(57,169,0,0.14)' }}><Icon.FileText size={16} /></div>
                <div style={{ flex: 1, minWidth: isMobile ? '100%' : 0, order: isMobile ? 3 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: colors.textFaint }}>Enviado: {r.sentDate}</div>
                </div>
                <span style={S.badge(r.color)}>{r.status}</span>
                <div style={{ display: 'flex', gap: 6, marginLeft: isMobile ? 'auto' : 0 }}>
                  <ActionButton title="Descargar" onClick={() => handleDownload(r)}><IconDownload /></ActionButton>
                  <ActionButton title="Detalles" onClick={() => openReportModal(r, 'info')}><IconInfo /></ActionButton>
                  <ActionButton title="Borrar" danger onClick={() => handleDelete(r)}><IconTrash /></ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...S.card, padding: isMobile ? '18px' : '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Fechas Importantes</div>
              <div style={eyebrow}>Establecidas por coordinación</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {datesList.length === 0 && (
              <div style={{ padding: '18px 4px', textAlign: 'center', fontSize: 12.5, color: colors.textFaint }}>
                No hay fechas registradas.
              </div>
            )}
            {datesList.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
                background: d.urgent ? (theme === 'dark' ? 'linear-gradient(135deg, rgba(180,83,9,0.14), rgba(180,83,9,0.05))' : 'linear-gradient(135deg, #FFF6E9, #FFFBF3)') : rowBg,
                border: `1px solid ${d.urgent ? urgentBorder : colors.border}`,
                boxShadow: d.urgent ? '0 6px 16px -4px rgba(180,83,9,0.22)' : 'none',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: theme === 'dark' ? 'rgba(180,83,9,0.16)' : '#FFF1DC', border: `1px solid ${theme === 'dark' ? 'rgba(180,83,9,0.35)' : '#FCE0B4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: amber, flexShrink: 0, boxShadow: '0 3px 8px rgba(180,83,9,0.18)' }}><Icon.Calendar /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: colors.textFaint }}>{d.date}</div>
                </div>
                {d.urgent && <span style={{ fontSize: 10, fontWeight: 700, color: amber, flexShrink: 0 }}>Urgente</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Historial de Entregas + próxima fecha límite */}
      <div style={{ ...S.card, padding: isMobile ? '18px' : '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Historial de Entregas</div>
            <div style={eyebrow}>Últimos 6 meses</div>
          </div>
          <span style={{
            fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
            color: nextDeadline.diffDays <= 5 ? amber : senaDeep,
            background: nextDeadline.diffDays <= 5 ? amberBg : (theme === 'dark' ? 'rgba(57,169,0,0.12)' : '#EEF9E7'),
            border: `1px solid ${nextDeadline.diffDays <= 5 ? '#FCE0B4' : (theme === 'dark' ? 'rgba(57,169,0,0.3)' : '#D6F0C4')}`,
          }}>
            {nextDeadline.diffDays >= 0
              ? `Quedan ${nextDeadline.diffDays} día${nextDeadline.diffDays === 1 ? '' : 's'} para el cierre (${nextDeadline.label})`
              : `Cierre: ${nextDeadline.label}`}
          </span>
        </div>

        {monthly.length === 0 ? (
          <div style={{ padding: '18px 4px', textAlign: 'center', fontSize: 12.5, color: colors.textFaint }}>
            Aún no hay informes registrados.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0, marginTop: 20 }}>
            {monthly.map((m, i) => {
              const badgeColor = colorForStatus(m.status);
              const p = statusPalette[badgeColor];
              return (
                <div key={i} style={{
                  flex: 1, position: 'relative', display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column', alignItems: 'center',
                  gap: isMobile ? 12 : 0, padding: isMobile ? '8px 0' : 0,
                }}>
                  {!isMobile && (
                    <div style={{ position: 'absolute', top: 9, left: i === 0 ? '50%' : 0, right: i === monthly.length - 1 ? '50%' : 0, height: 2, background: colors.border, zIndex: 0 }} />
                  )}
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: p.text, border: `3px solid ${colors.card}`, boxShadow: `0 0 0 2px ${p.text}`, position: 'relative', zIndex: 1, flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: isMobile ? 8 : 6, marginTop: isMobile ? 0 : 10 }}>
                    <span style={{ fontSize: 12, fontWeight: m.current ? 700 : 500, color: m.current ? colors.text : colors.textFaint, whiteSpace: 'nowrap' }}>{m.label}</span>
                    <span style={{ ...S.badge(badgeColor), fontSize: 10.5, padding: '2px 9px' }}>{m.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}