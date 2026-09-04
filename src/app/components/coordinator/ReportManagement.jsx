import { useState, useEffect, useMemo, useRef } from 'react';
import Toast from '../Toast';
import { getReports, updateReport, downloadReportFile, uploadObservationImage } from '../../../services/reportsService';
import mammoth from 'mammoth';
import { useTheme } from '../../../ThemeContext';
import { addHistoryEntry } from './SharedViews.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileText, Folder, FolderOpen, Paperclip, CheckCircle2, Pencil, Bell, Info,
  ClipboardList, Download, Eye, AlertTriangle, BarChart3, ChevronDown, X,
  Check, Loader2, RefreshCw, LayoutGrid, List, FolderClosed,
  Highlighter, Strikethrough, StickyNote, Undo2, Trash2,
} from 'lucide-react';


/*
  ── Tema institucional SENA (claro / oscuro) ─────────────────────────
  Colores oficiales (Manual de Identidad Corporativa SENA / gov.co):
    Verde        #39A900  (principal)
    Verde oscuro #007832  (complementario)
    Azul oscuro  #00304D  (institucional)
    Amarillo/Dorado #FDC300  (institucional, acento)
    Naranja      #FC7323  (institucional, acento de alerta/corrección)

  Estos 5 tonos SÍ son institucionales y se usan como constantes de marca:
  no cambian entre modo claro/oscuro (--sena-*-solid). Lo que sí cambia
  por tema son las versiones "texto" (ajustadas para contraste sobre
  fondo claro u oscuro) y los tintes de fondo/borde de cada tarjeta.

  MODO OSCURO: se toma directamente del ThemeContext real de la app
  (useTheme() -> theme === 'dark'), el mismo que usan el resto de tus
  pantallas (ej. ComplianceView). Ya no hay detección propia aquí.
  ──────────────────────────────────────────────────────────────────── */
function ThemeVars() {
  return (
    <style>{`
      [data-sena-theme="light"] {
        --surface: #FFFFFF;
        --surface-alt: #F7F9FC;
        --surface-muted: #F0F2F5;
        --border: #E8ECF0;
        --border-soft: #F0F2F5;
        --text-primary: #111827;
        --text-secondary: #374151;
        --text-muted: #6B7280;
        --text-faint: #9CA3AF;
        --overlay: rgba(15, 23, 42, 0.55);
        --shadow-sm: 0 1px 4px rgba(0,0,0,0.04);
        --shadow-md: 0 4px 14px rgba(0,0,0,0.08);
        --shadow-lg: 0 24px 60px rgba(0,0,0,0.22);

        /* Verde institucional SENA (constante de marca) */
        --sena-green-solid: #39A900;
        --sena-green-strong: #007832;
        --sena-green: #007832;
        --sena-green-bg: #EAF3E4;
        --sena-green-border: #C9E3B8;

        /* Dorado institucional SENA (constante de marca) */
        --sena-gold-solid: #FDC300;
        --sena-gold: #8A6D00;
        --sena-gold-bg: #FBF3D6;
        --sena-gold-border: #F0DE94;

        /* Azul oscuro institucional SENA (constante de marca) */
        --sena-blue-solid: #00304D;
        --sena-blue: #00304D;
        --sena-blue-bg: #E7EEF2;
        --sena-blue-border: #C3D3DC;

        /* Naranja institucional SENA — acento de alerta/corrección (constante de marca) */
        --sena-orange-solid: #FC7323;
        --sena-orange: #B84E00;
        --sena-orange-bg: #FFF1E5;
        --sena-orange-border: #FFCDA3;

        --viewer-chrome: var(--sena-blue-solid);
        --viewer-tray: #4B5563;
      }

      [data-sena-theme="dark"] {
        --surface: #1E2530;
        --surface-alt: #171C24;
        --surface-muted: #262E3A;
        --border: #333E4D;
        --border-soft: #2A323F;
        --text-primary: #F1F5F9;
        --text-secondary: #CBD5E1;
        --text-muted: #94A3B8;
        --text-faint: #64748B;
        --overlay: rgba(0, 0, 0, 0.65);
        --shadow-sm: 0 1px 4px rgba(0,0,0,0.35);
        --shadow-md: 0 4px 14px rgba(0,0,0,0.45);
        --shadow-lg: 0 24px 60px rgba(0,0,0,0.6);

        --sena-green-solid: #39A900;
        --sena-green-strong: #007832;
        --sena-green: #74CB52;
        --sena-green-bg: #16301A;
        --sena-green-border: #2F6B1F;

        --sena-gold-solid: #FDC300;
        --sena-gold: #F3D170;
        --sena-gold-bg: #362B10;
        --sena-gold-border: #6B4F12;

        --sena-blue-solid: #00304D;
        --sena-blue: #8FB8CE;
        --sena-blue-bg: #16232B;
        --sena-blue-border: #2C4A5C;

        --sena-orange-solid: #FC7323;
        --sena-orange: #FFA766;
        --sena-orange-bg: #3A2210;
        --sena-orange-border: #6B3D14;

        --viewer-chrome: var(--sena-blue-solid);
        --viewer-tray: #11151B;
      }
    `}</style>
  );
}

const initialReports = [
  {
    id: 1, instructor: 'María González', type: 'GC', month: 'Noviembre 2024', status: 'Pendiente',
    date: '2024-11-05', initials: 'MG', color: 'var(--sena-green)', bg: 'var(--sena-green-bg)',
    fileName: 'Informe_GC_Noviembre_2024.pdf',
    fileType: 'pdf',
    filePages: 3,
    previewContent: [
      { label: 'Actividades realizadas', value: 'Formación técnica en programación web, React y Node.js con 32 aprendices del grupo ADSO-2024.' },
      { label: 'Horas impartidas', value: '80 horas presenciales + 20 horas virtuales' },
      { label: 'Porcentaje de asistencia', value: '92%' },
      { label: 'Observaciones', value: 'Se cumplieron todos los objetivos planteados para el mes. Pendiente ajuste en evaluación final.' },
      { label: 'Firma instructor', value: 'María González — C.C. 52.123.456' },
    ],
  },
  {
    id: 2, instructor: 'Carlos Rodríguez', type: 'GF', month: 'Noviembre 2024', status: 'Pendiente',
    date: '2024-11-04', initials: 'CR', color: 'var(--sena-blue)', bg: 'var(--sena-blue-bg)',
    fileName: 'Informe_GF_Noviembre_2024.pdf',
    fileType: 'pdf',
    filePages: 2,
    previewContent: [
      { label: 'Actividades formativas', value: 'Taller de redes de datos y configuración de routers Cisco con grupo Redes-2024.' },
      { label: 'Horas impartidas', value: '60 horas presenciales' },
      { label: 'Porcentaje de asistencia', value: '87%' },
      { label: 'Observaciones', value: 'Grupo con buen desempeño. Se requiere refuerzo en subnetting para 6 aprendices.' },
      { label: 'Firma instructor', value: 'Carlos Rodríguez — C.C. 79.456.123' },
    ],
  },
  {
    id: 3, instructor: 'María González', type: 'GC', month: 'Octubre 2024', status: 'Aprobado',
    date: '2024-10-30', initials: 'MG', color: 'var(--sena-green)', bg: 'var(--sena-green-bg)',
    fileName: 'Informe_GC_Octubre_2024.pdf',
    fileType: 'pdf',
    filePages: 3,
    previewContent: [
      { label: 'Actividades realizadas', value: 'Módulo de bases de datos SQL y PostgreSQL.' },
      { label: 'Horas impartidas', value: '80 horas' },
      { label: 'Porcentaje de asistencia', value: '95%' },
      { label: 'Observaciones', value: 'Excelente participación del grupo.' },
      { label: 'Firma instructor', value: 'María González — C.C. 52.123.456' },
    ],
  },
  {
    id: 4, instructor: 'Pedro Sánchez', type: 'GF', month: 'Noviembre 2024', status: 'A Corregir',
    date: '2024-11-02', initials: 'PS', color: 'var(--sena-orange)', bg: 'var(--sena-orange-bg)',
    fileName: 'Informe_GF_Nov_2024_v1.pdf',
    fileType: 'pdf',
    filePages: 2,
    previewContent: [
      { label: 'Actividades realizadas', value: 'Formación en sistemas operativos Linux.' },
      { label: 'Horas impartidas', value: '40 horas' },
      { label: 'Porcentaje de asistencia', value: '71%' },
      { label: 'Observaciones', value: 'Falta firma del coordinador de área. Horas no coinciden con planilla.' },
      { label: 'Firma instructor', value: 'Pedro Sánchez — C.C. 80.321.654' },
    ],
  },
  {
    id: 5, instructor: 'Laura Torres', type: 'GC', month: 'Octubre 2024', status: 'Aprobado',
    date: '2024-10-28', initials: 'LT', color: 'var(--sena-green)', bg: 'var(--sena-green-bg)',
    fileName: 'Informe_GC_Oct_2024_LT.pdf',
    fileType: 'pdf',
    filePages: 4,
    previewContent: [
      { label: 'Actividades realizadas', value: 'Electrónica analógica y digital, laboratorio de componentes.' },
      { label: 'Horas impartidas', value: '96 horas' },
      { label: 'Porcentaje de asistencia', value: '98%' },
      { label: 'Observaciones', value: 'Grupo destacado. Todos los aprendices superaron la evaluación parcial.' },
      { label: 'Firma instructor', value: 'Laura Torres — C.C. 43.789.012' },
    ],
  },
];

const STATUS_STYLES = {
  Pendiente:    { bg: 'var(--sena-gold-bg)', color: 'var(--sena-gold)', border: 'var(--sena-gold-border)' },
  Aprobado:     { bg: 'var(--sena-green-bg)', color: 'var(--sena-green)', border: 'var(--sena-green-border)' },
  'A Corregir': { bg: 'var(--sena-orange-bg)', color: 'var(--sena-orange)', border: 'var(--sena-orange-border)' },
};

const TYPE_COLORS = {
  GC: { bg: 'var(--sena-green-bg)', color: 'var(--sena-green)' },
  GF: { bg: 'var(--sena-blue-bg)', color: 'var(--sena-blue)' },
};

const TAB_STYLES = {
  Todos:        { active: { bg: 'var(--sena-blue-solid)', color: '#fff', border: 'var(--sena-blue-solid)' } },
  Pendientes:   { active: { bg: 'var(--sena-gold-solid)', color: '#fff', border: 'var(--sena-gold-solid)' } },
  Aprobados:    { active: { bg: 'var(--sena-green-solid)', color: '#fff', border: 'var(--sena-green-solid)' } },
  'A Corregir': { active: { bg: 'var(--sena-orange-solid)', color: '#fff', border: 'var(--sena-orange-solid)' } },
};

// ── Meses fijos (Enero a Diciembre) y helpers para agrupar/ordenar ──────────
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Soporta tanto "mm/aaaa" (ej. "07/2026") como "Nombre Año" (ej. "Noviembre 2024")
function parseMonthValue(monthStr) {
  if (!monthStr) return { name: '', year: null, index: -1 };
  const mmYyyy = monthStr.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYyyy) {
    const idx = parseInt(mmYyyy[1], 10) - 1;
    return { name: MONTH_NAMES[idx] || monthStr, year: parseInt(mmYyyy[2], 10), index: idx };
  }
  const nameYyyy = monthStr.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{4})$/);
  if (nameYyyy) {
    const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === nameYyyy[1].toLowerCase());
    return { name: MONTH_NAMES[idx] || nameYyyy[1], year: parseInt(nameYyyy[2], 10), index: idx };
  }
  const idx = MONTH_NAMES.findIndex(m => monthStr.toLowerCase().startsWith(m.toLowerCase()));
  return { name: idx >= 0 ? MONTH_NAMES[idx] : monthStr, year: null, index: idx };
}

// ─── Anotaciones sobre el documento (resaltar / tachar / comentario) ───────
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const ANNOTATION_TOOLS = [
  { key: 'highlight', label: 'Resaltar',   Icon: Highlighter,   color: '#8A6D00', bg: 'rgba(253,195,0,0.28)',  border: '#DDB400' },
  { key: 'strike',    label: 'Tachar',     Icon: Strikethrough, color: '#B84E00', bg: 'rgba(252,115,35,0.18)', border: '#FC7323' },
  { key: 'pin',       label: 'Comentario', Icon: StickyNote,    color: '#00304D', bg: 'rgba(0,48,77,0.14)',    border: '#00304D' },
];

function annotationLabel(a) {
  if (a.type === 'pin') return a.note ? `Comentario: "${a.note}"` : 'Comentario';
  if (a.type === 'strike') return 'Texto tachado';
  return 'Texto resaltado';
}

function AnnotationToolbar({ activeTool, setActiveTool, count, onUndo, onClear }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
      background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 10,
      marginBottom: 10, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginRight: 2 }}>Marcar error:</span>
      {ANNOTATION_TOOLS.map(t => {
        const active = activeTool === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTool(active ? null : t.key)}
            title={t.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
              border: `1.5px solid ${active ? t.border : 'var(--border)'}`,
              background: active ? t.bg : 'var(--surface)',
              color: active ? t.color : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <t.Icon size={13} strokeWidth={2.25} /> {t.label}
          </button>
        );
      })}
      <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />
      <button
        type="button" onClick={onUndo} disabled={count === 0} title="Deshacer última marca"
        style={{
          display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: count === 0 ? 'var(--text-faint)' : 'var(--text-secondary)',
          fontSize: 12, fontWeight: 600, cursor: count === 0 ? 'default' : 'pointer',
        }}
      ><Undo2 size={13} strokeWidth={2.25} /></button>
      <button
        type="button" onClick={onClear} disabled={count === 0} title="Borrar todas las marcas"
        style={{
          display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: count === 0 ? 'var(--text-faint)' : 'var(--sena-orange)',
          fontSize: 12, fontWeight: 600, cursor: count === 0 ? 'default' : 'pointer',
        }}
      ><Trash2 size={13} strokeWidth={2.25} /></button>
      {activeTool && (
        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
          {activeTool === 'pin'
            ? 'Haz clic donde está el error y escribe una nota corta.'
            : 'Arrastra sobre el texto, la fecha o la firma con el error (o solo haz clic).'}
        </span>
      )}
    </div>
  );
}

function AnnotationMark({ index, ann, onDelete }) {
  if (ann.type === 'pin') {
    return (
      <div
        title={`${ann.note || 'Comentario'} (clic para eliminar)`}
        onClick={(e) => { e.stopPropagation(); onDelete(ann.id); }}
        style={{
          position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto', zIndex: 15, cursor: 'pointer',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: '50%', background: '#00304D', color: '#fff',
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)', border: '2px solid #fff',
        }}>{index}</div>
      </div>
    );
  }
  const isStrike = ann.type === 'strike';
  return (
    <div
      title={`${isStrike ? 'Tachado' : 'Resaltado'} (clic para eliminar)`}
      onClick={(e) => { e.stopPropagation(); onDelete(ann.id); }}
      style={{
        position: 'absolute', left: `${ann.x}%`, top: `${ann.y}%`, width: `${ann.w}%`, height: `${ann.h}%`,
        background: isStrike ? 'rgba(252,115,35,0.16)' : 'rgba(253,195,0,0.32)',
        border: `1.5px solid ${isStrike ? '#FC7323' : '#DDB400'}`,
        borderRadius: 3, pointerEvents: 'auto', cursor: 'pointer', zIndex: 12,
      }}
    >
      {isStrike && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: '#FC7323', transform: 'translateY(-50%)' }} />
      )}
      <span style={{
        position: 'absolute', top: -9, left: -9, width: 16, height: 16, borderRadius: '50%',
        background: isStrike ? '#FC7323' : '#DDB400', color: '#fff', fontSize: 9, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}>{index}</span>
    </div>
  );
}

function AnnotationLayer({ pageNum, annotations, activeTool, onCreate, onDelete }) {
  const [draft, setDraft] = useState(null);
  const [pinDraft, setPinDraft] = useState(null);
  const containerRef = useRef(null);

  const pageAnnotations = annotations.filter(a => a.page === pageNum);

  const getPct = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    return { xPct, yPct };
  };

  const handleMouseDown = (e) => {
    if (!activeTool || activeTool === 'pin') return;
    e.preventDefault();
    const { xPct, yPct } = getPct(e);
    setDraft({ startX: xPct, startY: yPct, curX: xPct, curY: yPct });
  };
  const handleMouseMove = (e) => {
    if (!draft) return;
    const { xPct, yPct } = getPct(e);
    setDraft(d => ({ ...d, curX: xPct, curY: yPct }));
  };
  const handleMouseUp = () => {
    if (!draft) return;
    let x = Math.min(draft.startX, draft.curX);
    let y = Math.min(draft.startY, draft.curY);
    let w = Math.abs(draft.curX - draft.startX);
    let h = Math.abs(draft.curY - draft.startY);
    if (w < 2 || h < 1.5) {
      // Clic simple sin arrastrar: se crea una marca del tamaño de una línea,
      // centrada en el punto donde se hizo clic (ideal para fechas/firmas cortas).
      w = 22; h = 3.2;
      x = Math.max(0, Math.min(100 - w, draft.startX - w / 2));
      y = Math.max(0, Math.min(100 - h, draft.startY - h / 2));
    }
    onCreate({ page: pageNum, type: activeTool, x, y, w, h });
    setDraft(null);
  };
  const handleClick = (e) => {
    if (activeTool !== 'pin') return;
    const { xPct, yPct } = getPct(e);
    setPinDraft({ xPct, yPct, text: '' });
  };
  const savePin = () => {
    if (!pinDraft) return;
    const text = pinDraft.text.trim();
    if (!text) { setPinDraft(null); return; }
    onCreate({ page: pageNum, type: 'pin', x: pinDraft.xPct, y: pinDraft.yPct, w: 0, h: 0, note: text });
    setPinDraft(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => draft && handleMouseUp()}
      onClick={handleClick}
      style={{
        position: 'absolute', inset: 0,
        cursor: activeTool ? (activeTool === 'pin' ? 'copy' : 'crosshair') : 'default',
        pointerEvents: activeTool ? 'auto' : 'none',
        userSelect: activeTool ? 'none' : 'auto',
      }}
    >
      {pageAnnotations.map((a, i) => (
        <AnnotationMark key={a.id} index={annotations.indexOf(a) + 1} ann={a} onDelete={onDelete} />
      ))}
      {draft && (
        <div style={{
          position: 'absolute',
          left: `${Math.min(draft.startX, draft.curX)}%`, top: `${Math.min(draft.startY, draft.curY)}%`,
          width: `${Math.abs(draft.curX - draft.startX)}%`, height: `${Math.abs(draft.curY - draft.startY)}%`,
          background: activeTool === 'strike' ? 'rgba(252,115,35,0.18)' : 'rgba(253,195,0,0.28)',
          border: `1.5px dashed ${activeTool === 'strike' ? '#FC7323' : '#DDB400'}`,
          pointerEvents: 'none',
        }} />
      )}
      {pinDraft && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: `${Math.min(pinDraft.xPct, 74)}%`, top: `${Math.min(pinDraft.yPct, 82)}%`,
            width: 220, background: '#fff', borderRadius: 10, border: '1px solid #E8ECF0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)', padding: 10, zIndex: 20, pointerEvents: 'auto',
          }}
        >
          <textarea
            autoFocus
            value={pinDraft.text}
            onChange={(e) => setPinDraft(d => ({ ...d, text: e.target.value }))}
            placeholder="¿Cuál es el error aquí?"
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 56, fontSize: 12, borderRadius: 6, border: '1px solid #E8ECF0', padding: 6, fontFamily: 'inherit', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setPinDraft(null)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E8ECF0', background: '#F7F9FC', fontSize: 11.5, cursor: 'pointer' }}>Cancelar</button>
            <button type="button" onClick={savePin} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#39A900', color: '#fff', fontWeight: 700, fontSize: 11.5, cursor: 'pointer' }}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Visor de documento REAL ──────────────────────────────────────────────────
// Reemplaza al antiguo "Visor de PDF simulado": en vez de dibujar una
// plantilla inventada con los metadatos del informe, descarga el archivo
// ORIGINAL que subió el instructor (GET /informe/:id/archivo, vía
// downloadReportFile) y lo muestra tal cual:
//   - PDF   -> se embebe con <iframe>, usando el visor nativo del navegador.
//   - Word  -> se convierte a HTML con mammoth (misma librería que ya usa
//              FilePreviewModal.jsx para la vista previa del instructor
//              antes de subir el archivo).
//   - Imagen -> se muestra directo.
//   - Sin archivo original (informes antiguos, 404) -> se avisa claramente
//     en vez de inventar contenido; en una pantalla donde el coordinador
//     aprueba o rechaza, mostrar un documento fabricado sería engañoso.
function RealDocumentViewer({ report, annotations, activeTool, onCreateAnnotation, onDeleteAnnotation }) {
  const [state, setState] = useState({ loading: true, error: null, notFound: false, blobUrl: null, docxHtml: null, kind: null });

  useEffect(() => {
    let cancelled = false;
    let localBlobUrl = null;
    setState({ loading: true, error: null, notFound: false, blobUrl: null, docxHtml: null, kind: null });

    (async () => {
      try {
        const blob = await downloadReportFile(report.id);
        if (cancelled) return;

        const name = report.fileName || '';
        const isPdf = /\.pdf$/i.test(name) || blob.type === 'application/pdf';
        const isDocx = /\.docx?$/i.test(name);
        const isImage = /\.(jpe?g|png|gif|webp)$/i.test(name) || /^image\//.test(blob.type || '');

        if (isDocx) {
          const arrayBuffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (cancelled) return;
          setState({ loading: false, error: null, notFound: false, blobUrl: null, docxHtml: result.value, kind: 'docx' });
        } else {
          localBlobUrl = URL.createObjectURL(blob);
          setState({
            loading: false, error: null, notFound: false, docxHtml: null,
            blobUrl: localBlobUrl, kind: isPdf ? 'pdf' : (isImage ? 'image' : 'other'),
          });
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 404) {
          setState({ loading: false, error: null, notFound: true, blobUrl: null, docxHtml: null, kind: null });
        } else {
          setState({ loading: false, error: err.message || 'No se pudo cargar el documento.', notFound: false, blobUrl: null, docxHtml: null, kind: null });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    };
  }, [report.id, report.fileName]);

  // Capa de marcado (resaltar/tachar/comentar) superpuesta al documento real.
  // A diferencia del visor simulado anterior (que sabía exactamente cuántas
  // "páginas" fabricadas tenía), aquí no conocemos la paginación real del
  // PDF sin una librería de renderizado página por página (pdf.js). Por eso
  // las marcas se ubican como porcentaje sobre todo el área visible del
  // documento (equivalente a tratarlo como una sola página), en vez de por
  // página exacta. Sigue siendo útil para señalar "aquí está el error" al
  // instructor, solo que no se ancla a un número de página específico.
  const withAnnotationOverlay = (children) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 500 }}>
      {children}
      {activeTool !== undefined && (
        <AnnotationLayer
          pageNum={1}
          annotations={annotations}
          activeTool={activeTool}
          onCreate={onCreateAnnotation}
          onDelete={onDeleteAnnotation}
        />
      )}
    </div>
  );

  const wrap = (children) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'var(--viewer-chrome)', borderRadius: '10px 10px 0 0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} color="#d1d5db" strokeWidth={2} />
          <span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 500, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.fileName}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, background: 'var(--viewer-tray)', borderRadius: '0 0 10px 10px', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );

  if (state.loading) {
    return wrap(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 13 }}>
        Cargando documento original…
      </div>
    );
  }

  if (state.notFound) {
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#d1d5db', fontSize: 13, textAlign: 'center', padding: 24, gap: 8 }}>
        <FileText size={28} strokeWidth={1.5} />
        <div>Este informe no tiene un archivo original guardado en el servidor.</div>
        <div style={{ fontSize: 11.5, color: '#9ca3af' }}>Es probable que se haya creado antes de que existiera la carga de archivos, o que se haya cargado por un canal (como el chat) que aún no guarda el archivo. No es posible mostrar aquí un documento real.</div>
      </div>
    );
  }

  if (state.error) {
    return wrap(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#f87171', fontSize: 13, textAlign: 'center', padding: 24 }}>
        {state.error}
      </div>
    );
  }

  if (state.kind === 'pdf' || state.kind === 'other') {
    return wrap(
      withAnnotationOverlay(
        <iframe
          src={state.blobUrl}
          title={report.fileName}
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 500 }}
        />
      )
    );
  }

  if (state.kind === 'image') {
    return wrap(
      withAnnotationOverlay(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20 }}>
          <img src={state.blobUrl} alt={report.fileName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )
    );
  }

  if (state.kind === 'docx') {
    return wrap(
      withAnnotationOverlay(
        <div style={{ padding: '32px 28px' }}>
          {/* mammoth convierte el .docx a HTML "en crudo": conserva las
              tablas, encabezados y listas del documento original, pero sin
              ningún CSS. Sin estas reglas, las tablas del informe (ej. la
              tabla de actividades/evidencias) se renderizan con el layout
              automático del navegador — celdas sin borde que se encogen al
              contenido — y el texto se ve descuadrado en vez de como una
              tabla real. */}
          <style>{`
            .docx-render-content table { width: 100%; border-collapse: collapse; margin: 14px 0; table-layout: fixed; }
            .docx-render-content table td, .docx-render-content table th { border: 1px solid #E5E7EB; padding: 8px 10px; text-align: left; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
            .docx-render-content table th { background: #F7F9FC; font-weight: 700; }
            .docx-render-content img { max-width: 100%; height: auto; }
            .docx-render-content p { margin: 0 0 10px; }
            .docx-render-content h1, .docx-render-content h2, .docx-render-content h3 { margin: 18px 0 8px; }
            .docx-render-content ul, .docx-render-content ol { padding-left: 22px; margin: 0 0 10px; }
          `}</style>
          <div
            className="docx-render-content"
            style={{ background: '#fff', borderRadius: 10, padding: '36px 44px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: 760, margin: '0 auto', color: '#111827', fontSize: 14, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: state.docxHtml }}
          />
        </div>
      )
    );
  }

  return null;
}

// ─── Visor de PDF simulado (LEGACY, ya no se usa) ─────────────────────────────
// Se conserva solo como referencia histórica; ReviewModal ahora usa
// RealDocumentViewer, que muestra el archivo real en vez de esta plantilla
// fabricada con los metadatos del informe.
function PdfViewer({ report, annotations, activeTool, onCreateAnnotation, onDeleteAnnotation }) {
  const pages = Array.from({ length: report.filePages }, (_, i) => i + 1);

  const renderPageBody = (pageNum) => {
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
                  <td style={{ padding: '8px 10px', color: '#111827', border: '1px solid #E8ECF0' }}>{report.date}</td>
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
            <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {['Lista de asistencia firmada', 'Planeación pedagógica', 'Registro fotográfico', 'Evaluaciones aplicadas'].map((ev, i) => (
                <div key={i} style={{ background: '#EAF3E4', border: '1px solid #C9E3B8', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#007832', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} strokeWidth={2.25} /> {ev}
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
      case 4:
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14, textAlign: 'center' }}>
              Anexos adicionales
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 2 }}>
              {['Anexo 1: Cronograma de actividades', 'Anexo 2: Resultados de aprendizaje', 'Anexo 3: Registro de novedades'].map((a, i) => (
                <div key={i} style={{ padding: '8px 12px', background: i % 2 === 0 ? '#F7F9FC' : '#fff', borderRadius: 6, marginBottom: 4, border: '1px solid #E8ECF0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Paperclip size={13} strokeWidth={2} /> {a}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Las hojas del documento se muestran como "papel" (fondo blanco, texto
  // oscuro) de forma constante en ambos temas, igual que en lectores de PDF
  // reales, aunque la app esté en modo oscuro.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'var(--viewer-chrome)', borderRadius: '10px 10px 0 0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} color="#d1d5db" strokeWidth={2} />
          <span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.fileName}
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{report.filePages} páginas</span>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', background: 'var(--viewer-tray)',
        padding: '16px', borderRadius: '0 0 10px 10px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {pages.map((pageNum) => (
          <div key={pageNum} style={{
            position: 'relative',
            background: '#fff', borderRadius: 8,
            padding: '32px 28px', minHeight: 400,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            fontFamily: "'Times New Roman', serif",
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #111827' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1, textTransform: 'uppercase' }}>
                Servicio Nacional de Aprendizaje — SENA
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Sistema de Información y Trazabilidad del Instructor</div>
              <div style={{ marginTop: 10, display: 'inline-block', background: report.type === 'GC' ? '#EAF3E4' : '#E7EEF2', color: report.type === 'GC' ? '#007832' : '#00304D', padding: '3px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                INFORME {report.type} — {report.month.toUpperCase()}
              </div>
            </div>

            {renderPageBody(pageNum)}

            <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #E8ECF0', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
              <span>SENA — SITMI</span>
              <span>Página {pageNum} de {report.filePages}</span>
              <span>{report.date}</span>
            </div>

            <AnnotationLayer
              pageNum={pageNum}
              annotations={annotations}
              activeTool={activeTool}
              onCreate={onCreateAnnotation}
              onDelete={onDeleteAnnotation}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal de revisión con visor ─────────────────────────────────────────────
const NOTIFICATION_TYPES = [
  { value: 'faltante',    label: 'Documento Faltante',      Icon: FolderOpen,    color: 'var(--sena-gold)', bg: 'var(--sena-gold-bg)' },
  { value: 'correccion',  label: 'Corrección Necesaria',    Icon: Pencil,        color: 'var(--sena-orange)', bg: 'var(--sena-orange-bg)' },
  { value: 'recordatorio',label: 'Recordatorio',            Icon: Bell,          color: 'var(--sena-green)', bg: 'var(--sena-green-bg)' },
  { value: 'general',     label: 'Información General',     Icon: Info,          color: 'var(--text-muted)', bg: 'var(--surface-alt)' },
];

function ReviewModal({ report, onClose, onApprove, onCorrect, onDownload }) {
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('doc'); // 'doc' | 'info'
  const [notifType, setNotifType] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  // Imagen adjunta a la observación (evidencia adicional del error, ej. un
  // pantallazo). Se guarda como data URL en memoria: solo vive mientras el
  // modal está abierto, se muestra en la vista previa y se referencia por
  // nombre en la observación al aprobar/pedir corrección.
  const [attachedImage, setAttachedImage] = useState(null); // { name, dataUrl }
  const imageInputRef = useRef(null);
  // Mensaje de error de validación de la imagen adjunta (tipo o tamaño
  // inválido). Se declara aquí, junto a los demás hooks del componente y
  // ANTES del "if (!report) return null;" de más abajo — los hooks de
  // React siempre deben ejecutarse en el mismo orden en cada render,
  // nunca después de un return condicional.
  const [imageError, setImageError] = useState(null);

  // Cada vez que se abre un informe distinto, se limpian las marcas del
  // documento anterior.
  useEffect(() => {
    setAnnotations([]);
    setActiveTool(null);
    setNote('');
    setNotifType('');
    setAttachedImage(null);
  }, [report?.id]);

  if (!report) return null;

  const selectedType = NOTIFICATION_TYPES.find(t => t.value === notifType);

  const createAnnotation = (ann) => {
    setAnnotations(prev => [...prev, { ...ann, id: uid() }]);
  };
  const deleteAnnotation = (id) => setAnnotations(prev => prev.filter(a => a.id !== id));
  const undoAnnotation = () => setAnnotations(prev => prev.slice(0, -1));
  const clearAnnotations = () => setAnnotations([]);

  // Límite de tamaño del lado del cliente para la imagen adjunta. El
  // dataUrl solo se usa para la miniatura local (nunca se manda al
  // backend); el archivo real (`file`) se sube aparte con
  // uploadObservationImage. 8 MB es un margen cómodo para un pantallazo
  // o foto normal sin acercarse a límites típicos de subida de archivos.
  const MAX_IMAGE_MB = 8;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo después de quitarlo
    if (!file) return;
    setImageError(null);
    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen.');
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_IMAGE_MB) {
      setImageError(`La imagen supera el tamaño máximo de ${MAX_IMAGE_MB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAttachedImage({ name: file.name, dataUrl: reader.result, file });
    reader.readAsDataURL(file);
  };
  const removeAttachedImage = () => { setAttachedImage(null); setImageError(null); };

  // Antepone la referencia de la imagen adjunta (si hay) a la observación
  // escrita, tanto para Aprobar como para Solicitar Corrección.
  const buildNoteWithImage = () => {
    if (!attachedImage) return note;
    const imgRef = `📎 Imagen adjunta: ${attachedImage.name}`;
    return note ? `${note}\n\n${imgRef}` : imgRef;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--overlay)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 20,
        width: 'min(820px, 100%)', height: '92vh', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header del modal */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: report.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: report.color }}>
              {report.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Revisar Informe</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.instructor} · {report.type} · {report.month}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => onDownload(report)} title="Descargar" style={{ border: 'none', background: 'var(--sena-green-bg)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--sena-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={16} strokeWidth={2.25} /></button>
            <button onClick={onClose} style={{ border: 'none', background: 'var(--surface-muted)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={17} strokeWidth={2.25} /></button>
          </div>
        </div>

        {/* Tabs: Documento / Detalles */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 24px 0', borderBottom: '1px solid var(--border-soft)', flexShrink: 0 }}>
          {[
            { key: 'doc',  label: 'Ver Documento', Icon: FileText },
            { key: 'info', label: 'Detalles & Acción', Icon: ClipboardList },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? 'var(--sena-green)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--sena-green-solid)' : '2px solid transparent',
              marginBottom: -1, transition: 'all .15s',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <t.Icon size={14} strokeWidth={2.25} /> {t.label}
              {t.key === 'doc' && annotations.length > 0 && (
                <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: 'var(--sena-gold-bg)', color: 'var(--sena-gold)' }}>{annotations.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'doc' ? (
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexShrink: 0 }}>
                <div style={{ background: 'var(--sena-orange-bg)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <FileText size={15} strokeWidth={2.25} color="var(--sena-orange)" />
                  <span style={{ fontWeight: 600, color: 'var(--sena-orange)' }}>{(report.fileName || '').split('.').pop()?.toUpperCase() || 'ARCHIVO'}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{report.fileName}</span>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid var(--border)' }}>
                <RealDocumentViewer
                  report={report}
                  annotations={annotations}
                  activeTool={activeTool}
                  onCreateAnnotation={createAnnotation}
                  onDeleteAnnotation={deleteAnnotation}
                />
              </div>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--surface-alt)', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Resumen del informe</div>
                <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  <span><strong>Instructor:</strong> {report.instructor}</span>
                  <span><strong>Tipo:</strong> {report.type}</span>
                  <span><strong>Período:</strong> {report.month}</span>
                  <span><strong>Enviado:</strong> {report.date}</span>
                  <span><strong>Archivo:</strong> {report.fileName}</span>
                  <span><strong>Estado:</strong> {report.status}</span>
                </div>
              </div>

              {/* ── Tipo de Notificación ── */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Tipo de Notificación
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: `1.5px solid ${dropdownOpen ? 'var(--sena-green-solid)' : 'var(--border)'}`,
                      background: 'var(--surface)', fontSize: 13, color: selectedType ? 'var(--text-primary)' : 'var(--text-faint)',
                      cursor: 'pointer', textAlign: 'left', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: dropdownOpen ? '0 0 0 3px rgba(57,169,0,0.15)' : 'none',
                      transition: 'border-color .15s, box-shadow .15s',
                    }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedType ? (
                        <>
                          <span style={{ width: 24, height: 24, borderRadius: 6, background: selectedType.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: selectedType.color }}>
                            <selectedType.Icon size={14} strokeWidth={2.25} />
                          </span>
                          <span style={{ color: selectedType.color, fontWeight: 600 }}>{selectedType.label}</span>
                        </>
                      ) : 'Selecciona un tipo'}
                    </span>
                    <ChevronDown size={15} strokeWidth={2.25} style={{ color: 'var(--text-faint)', transition: 'transform .2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
                      background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-md)', overflow: 'hidden',
                    }}>
                      {NOTIFICATION_TYPES.map((t, i) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => { setNotifType(t.value); setDropdownOpen(false); }}
                          style={{
                            width: '100%', padding: '11px 16px', border: 'none', cursor: 'pointer',
                            background: notifType === t.value ? t.bg : 'transparent',
                            display: 'flex', alignItems: 'center', gap: 10,
                            textAlign: 'left', fontSize: 13,
                            borderBottom: i < NOTIFICATION_TYPES.length - 1 ? '1px solid var(--border-soft)' : 'none',
                            transition: 'background .1s',
                          }}
                          onMouseEnter={e => { if (notifType !== t.value) e.currentTarget.style.background = t.bg; }}
                          onMouseLeave={e => { if (notifType !== t.value) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: t.color, flexShrink: 0 }}>
                            <t.Icon size={15} strokeWidth={2.25} />
                          </span>
                          <span style={{ fontWeight: notifType === t.value ? 700 : 500, color: notifType === t.value ? t.color : 'var(--text-secondary)' }}>{t.label}</span>
                          {notifType === t.value && <Check size={15} strokeWidth={2.5} style={{ marginLeft: 'auto', color: t.color }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo observaciones */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Observaciones {report.status === 'A Corregir' ? '(requeridas para corrección)' : ''}
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Escribe observaciones o motivo de corrección..."
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                    borderRadius: 10, border: '1px solid var(--border)', fontSize: 13,
                    color: 'var(--text-secondary)', background: 'var(--surface-alt)', outline: 'none',
                    resize: 'vertical', minHeight: 90, fontFamily: 'inherit',
                  }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, textAlign: 'right' }}>{note.length} caracteres</div>

                {/* Adjuntar imagen a la observación */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                {!attachedImage ? (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      marginTop: 8, padding: '7px 12px', borderRadius: 8,
                      border: '1px dashed var(--border)', background: 'var(--surface-alt)',
                      color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Paperclip size={13} strokeWidth={2.25} /> Adjuntar imagen
                  </button>
                ) : (
                  <div style={{
                    marginTop: 8, display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)',
                    background: 'var(--surface-alt)',
                  }}>
                    <img
                      src={attachedImage.dataUrl}
                      alt={attachedImage.name}
                      style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                    />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attachedImage.name}
                    </span>
                    <button
                      type="button"
                      onClick={removeAttachedImage}
                      title="Quitar imagen"
                      style={{ border: 'none', background: 'none', color: 'var(--text-faint)', cursor: 'pointer', flexShrink: 0, display: 'flex' }}
                    >
                      <X size={15} strokeWidth={2.25} />
                    </button>
                  </div>
                )}
                {imageError && (
                  <div style={{ marginTop: 6, fontSize: 11.5, color: '#dc2626' }}>{imageError}</div>
                )}
              </div>

              {/* Acciones */}
              {report.status !== 'Aprobado' && (
                <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => onCorrect(report.id, buildNoteWithImage(), notifType, annotations, attachedImage)} style={{
                    padding: '12px', borderRadius: 10, border: 'none',
                    background: 'var(--sena-orange-bg)', color: 'var(--sena-orange)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}>
                    <Pencil size={15} strokeWidth={2.25} /> Solicitar Corrección
                  </button>
                  <button onClick={() => onApprove(report.id, buildNoteWithImage(), notifType, attachedImage)} style={{
                    padding: '12px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, var(--sena-green-solid), var(--sena-green-strong))', color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}>
                    <CheckCircle2 size={15} strokeWidth={2.25} /> Aprobar Informe
                  </button>
                </div>
              )}
              {report.status === 'Aprobado' && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--sena-green-bg)', border: '1px solid var(--sena-green-border)', fontSize: 13, color: 'var(--sena-green)', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <CheckCircle2 size={15} strokeWidth={2.25} /> Este informe ya fue aprobado
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fila de informe (reutilizada en Vista Lista y dentro de una carpeta) ────
function ReportRow({ r, onDownload, onOpen }) {
  const st = STATUS_STYLES[r.status];
  const tc = TYPE_COLORS[r.type];
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 14, padding: '16px 20px',
      border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)',
      display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow .15s', flexWrap: 'wrap',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      <div style={{ width: 42, height: 42, borderRadius: 12, background: r.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: r.color }}>
        {r.initials}
      </div>
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{r.instructor}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '2px 8px', borderRadius: 6, background: tc.bg, color: tc.color, fontWeight: 600, fontSize: 11 }}>{r.type}</span>
          {r.month}
          <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Paperclip size={12} strokeWidth={2} /> {r.fileName}</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{r.date}</span>
      <span style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
        {r.status}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onDownload(r)} title="Descargar" style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Download size={13} strokeWidth={2.25} /> Descargar
        </button>
        {r.status === 'Pendiente' && (
          <button onClick={() => onOpen(r)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--sena-green-solid)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Eye size={13} strokeWidth={2.25} /> Revisar
          </button>
        )}
        {r.status === 'A Corregir' && (
          <button onClick={() => onOpen(r)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--sena-orange-solid)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Pencil size={13} strokeWidth={2.25} /> Revisar
          </button>
        )}
        {r.status === 'Aprobado' && (
          <button onClick={() => onOpen(r)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--sena-green-border)', background: 'var(--sena-green-bg)', color: 'var(--sena-green)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Eye size={13} strokeWidth={2.25} /> Ver Documento
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tarjeta de carpeta (instructor o mes) ───────────────────────────────────
function FolderCard({ label, sublabel, count, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
        padding: '16px 18px', borderRadius: 14, border: '1px solid var(--border-soft)',
        background: 'var(--surface)', cursor: 'pointer', textAlign: 'left',
        boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .15s, transform .1s',
        width: '100%',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          <Folder size={19} strokeWidth={2} />
        </div>
        <span style={{
          marginLeft: 'auto', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: 'var(--surface-muted)', color: 'var(--text-muted)',
        }}>{count}</span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</div>}
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ReportManagement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [reviewingReport, setReviewingReport] = useState(null);
  const [toast, setToast] = useState(null);

  // Vista: 'carpetas' (por instructor > mes, autogeneradas) o 'lista' (plana con filtros)
  const [viewMode, setViewMode] = useState('carpetas');
  const [openInstructor, setOpenInstructor] = useState(null);
  const [openMonth, setOpenMonth] = useState(null);

  const showToast = (msg, color = '#39A900') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.warn("Backend offline o error al cargar reportes. Usando datos de respaldo.", err);
      setError(err.message);
      setReports(initialReports);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const addNotification = (type, title, message) => {
    const saved = JSON.parse(localStorage.getItem('sena_notifications') || '[]');
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO');
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const newNotif = {
      id: Date.now(),
      type,
      title,
      message: `${message} (${dateStr} ${timeStr})`,
      date: dateStr,
      read: false
    };
    saved.unshift(newNotif);
    localStorage.setItem('sena_notifications', JSON.stringify(saved));
  };

  // Descarga el archivo ORIGINAL (PDF/Word) que el instructor subió,
  // exactamente como quedó guardado en el backend (GET /informe/:id/archivo).
  // Antes esta función fabricaba un .txt con los metadatos del informe y lo
  // renombraba con extensión .pdf — nunca era el documento real, y además
  // el archivo resultante ni siquiera se podía abrir como PDF de verdad.
  const handleDownload = async (report) => {
    try {
      const blob = await downloadReportFile(report.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileName || 'informe.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Descargando ${report.fileName}...`);
    } catch (err) {
      if (err?.status === 404) {
        showToast('Este informe no tiene un archivo original guardado en el servidor.', '#D2A22E');
        return;
      }
      showToast(err.message || 'Error al descargar el archivo', '#ef4444');
    }
  };

  const handleApprove = async (id, note, notifType, attachedImage) => {
    try {
      // El PATCH que aprueba solo lleva texto — liviano, no puede dar
      // "request entity too large". La imagen (si hay) se sube aparte,
      // como archivo real, DESPUÉS de que la aprobación ya tuvo éxito.
      await updateReport(id, {
        status: 'Aprobado',
        observacion: note || 'Aprobado sin observaciones',
        tipo_notificacion: notifType || 'general',
      });

      let imageUploadFailed = false;
      if (attachedImage?.file) {
        try {
          await uploadObservationImage(id, attachedImage.file);
        } catch (imgErr) {
          // No relanzamos: la aprobación ya se guardó y no debe perderse
          // por un problema al subir la imagen. Solo avisamos aparte.
          imageUploadFailed = true;
          console.error('No se pudo subir la imagen de observación:', imgErr);
        }
      }

      setReports(prev => prev.map(r => r.id === id ? {
        ...r,
        status: 'Aprobado',
        observacion: note || 'Aprobado sin observaciones',
        tipo_notificacion: notifType || 'general',
        hasImagenObservacion: r.hasImagenObservacion || (!!attachedImage?.file && !imageUploadFailed),
        color: 'var(--sena-green)',
        bg: 'var(--sena-green-bg)'
      } : r));

      if (imageUploadFailed) {
        showToast('Informe aprobado, pero la imagen adjunta no se pudo subir.', '#D2A22E');
      }

      const rep = reports.find(r => r.id === id);
      if (rep) {
        addNotification(
          'success',
          'Informe aprobado',
          `Tu informe ${rep.type} de ${rep.month} ha sido aprobado por el coordinador`
        );
        addHistoryEntry({
          action: 'Informe aprobado',
          detail: `Informe ${rep.type} de ${rep.instructor} — ${rep.month}${note ? `: "${note}"` : ''}`,
          instructor: rep.instructor,
          type: 'Informes',
          kind: 'approved',
        });
      }

      showToast('Informe aprobado en la base de datos');
    } catch (err) {
      showToast(`Error al aprobar: ${err.message}`, '#FC7323');
    } finally {
      setReviewingReport(null);
    }
  };

  // marks: lista de anotaciones hechas sobre el documento (resaltados, tachados
  // y comentarios/pin) que el coordinador dejó en el visor. Se resumen y se
  // agregan automáticamente a la observación para que el instructor sepa
  // exactamente dónde está el error.
  const handleCorrect = async (id, note, notifType, marks = [], attachedImage) => {
    try {
      const marksSummary = marks.length > 0
        ? '\n\nMarcas señaladas en el documento:\n' + marks
            .map((m, i) => `${i + 1}. Página ${m.page} — ${annotationLabel(m)}`)
            .join('\n')
        : '';
      const baseNote = note || 'Solicitud de corrección sin observaciones detalladas.';
      const fullObservacion = baseNote + marksSummary;

      // El PATCH que pide corrección solo lleva texto/marcas — liviano.
      // La imagen (si hay) se sube aparte, como archivo real, DESPUÉS de
      // que la solicitud de corrección ya tuvo éxito.
      await updateReport(id, {
        status: 'A Corregir',
        observacion: fullObservacion,
        tipo_notificacion: notifType || 'correccion',
        marcas: marks,
      });

      let imageUploadFailed = false;
      if (attachedImage?.file) {
        try {
          await uploadObservationImage(id, attachedImage.file);
        } catch (imgErr) {
          imageUploadFailed = true;
          console.error('No se pudo subir la imagen de observación:', imgErr);
        }
      }

      setReports(prev => prev.map(r => r.id === id ? {
        ...r,
        status: 'A Corregir',
        observacion: fullObservacion,
        tipo_notificacion: notifType || 'correccion',
        marcas: marks,
        hasImagenObservacion: r.hasImagenObservacion || (!!attachedImage?.file && !imageUploadFailed),
        color: 'var(--sena-orange)',
        bg: 'var(--sena-orange-bg)'
      } : r));

      if (imageUploadFailed) {
        showToast('Corrección solicitada, pero la imagen adjunta no se pudo subir.', '#D2A22E');
      }

      const rep = reports.find(r => r.id === id);
      if (rep) {
        addNotification(
          'alert',
          'Corrección requerida',
          `El coordinador solicitó corregir tu informe ${rep.type} de ${rep.month}${note ? ': "' + note + '"' : ''}${marks.length ? ` (${marks.length} marca${marks.length === 1 ? '' : 's'} en el documento)` : ''}`
        );
        addHistoryEntry({
          action: 'Corrección solicitada',
          detail: `Informe ${rep.type} de ${rep.instructor} — ${rep.month}${note ? `: "${note}"` : ''}${marks.length ? ` (${marks.length} marca${marks.length === 1 ? '' : 's'})` : ''}`,
          instructor: rep.instructor,
          type: 'Informes',
          kind: 'rejected',
        });
      }

      showToast('Corrección guardada en la base de datos' + (note ? ': ' + note.slice(0, 30) : ''), '#FC7323');
    } catch (err) {
      showToast(`Error al solicitar corrección: ${err.message}`, '#FC7323');
    } finally {
      setReviewingReport(null);
    }
  };

  // ── Reporte histórico consolidado por instructor ──────────────────────────
  // Toma TODOS los informes del instructor (de todos los meses, sin importar
  // los filtros de búsqueda/estado activos) y genera un PDF descargable con
  // tarjetas de resumen, gráficas de cumplimiento y el detalle cronológico
  // en una tabla.
  const generateInstructorHistory = (instructorName) => {
    const instructorReports = reports
      .filter(r => r.instructor === instructorName)
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (instructorReports.length === 0) {
      showToast('No hay informes registrados para este instructor', '#FC7323');
      return;
    }

    const total = instructorReports.length;
    const aprobados = instructorReports.filter(r => r.status === 'Aprobado').length;
    const corregir = instructorReports.filter(r => r.status === 'A Corregir').length;
    const pendientes = instructorReports.filter(r => r.status === 'Pendiente').length;
    const cumplimiento = total > 0 ? Math.round((aprobados / total) * 100) : 0;

    const mesesUnicos = Array.from(new Set(instructorReports.map(r => r.month)));
    const tiposUnicos = Array.from(new Set(instructorReports.map(r => r.type)));

    // Paleta institucional SENA en RGB, para uso directo con jsPDF
    const GREEN_SOLID = [57, 169, 0];
    const GREEN = [0, 120, 50];
    const GREEN_BG = [234, 243, 228];
    const GOLD_SOLID = [253, 195, 0];
    const GOLD = [138, 109, 0];
    const GOLD_BG = [251, 243, 214];
    const BLUE = [0, 48, 77];
    const BLUE_BG = [231, 238, 242];
    const ORANGE_SOLID = [252, 115, 35];
    const ORANGE = [184, 78, 0];
    const ORANGE_BG = [255, 241, 229];
    const TEXT = [17, 24, 39];
    const MUTED = [107, 114, 128];
    const BORDER = [232, 236, 240];
    const BG_ALT = [247, 249, 252];

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y;

    // ── Encabezado institucional ──
    doc.setFillColor(...GREEN_SOLID);
    doc.rect(0, 0, pageWidth, 96, 'F');
    doc.setFillColor(...GREEN);
    doc.rect(0, 96, pageWidth, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SERVICIO NACIONAL DE APRENDIZAJE — SENA', margin, 32);
    doc.setFontSize(17);
    doc.text('Reporte Histórico de Cumplimiento', margin, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Sistema de Información y Trazabilidad del Instructor (SITMI)', margin, 73);

    const now = new Date();
    const genDate = `${now.toLocaleDateString('es-CO')} · ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    doc.setFontSize(8.5);
    doc.text(`Generado: ${genDate}`, pageWidth - margin, 32, { align: 'right' });

    y = 128;

    // ── Datos del instructor ──
    doc.setTextColor(...TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(instructorName, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `Tipos de informe: ${tiposUnicos.join(', ')}   ·   Periodo: ${mesesUnicos[0]} — ${mesesUnicos[mesesUnicos.length - 1]}   ·   Meses con envíos: ${mesesUnicos.length}`,
      margin, y + 16,
    );

    y += 38;

    // ── Tarjetas de resumen ──
    const cardGap = 10;
    const cardW = (pageWidth - margin * 2 - cardGap * 3) / 4;
    const cardH = 58;
    const cards = [
      { label: 'Total informes', value: String(total), color: BLUE, bg: BLUE_BG },
      { label: 'Aprobados', value: String(aprobados), color: GREEN, bg: GREEN_BG },
      { label: 'Pendientes', value: String(pendientes), color: GOLD, bg: GOLD_BG },
      { label: 'A corregir', value: String(corregir), color: ORANGE, bg: ORANGE_BG },
    ];
    cards.forEach((c, i) => {
      const x = margin + i * (cardW + cardGap);
      doc.setFillColor(...c.bg);
      doc.roundedRect(x, y, cardW, cardH, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...c.color);
      doc.text(c.value, x + 14, y + 32);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(c.label, x + 14, y + 46);
    });

    y += cardH + 32;

    // ── Gráfica: barra de cumplimiento ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...TEXT);
    doc.text('Porcentaje de cumplimiento', margin, y);
    doc.setTextColor(...GREEN);
    doc.text(`${cumplimiento}%`, pageWidth - margin, y, { align: 'right' });
    y += 10;

    const barW = pageWidth - margin * 2;
    const barH = 14;
    doc.setFillColor(240, 242, 245);
    doc.roundedRect(margin, y, barW, barH, 7, 7, 'F');
    const fillW = cumplimiento > 0 ? Math.max(barW * (cumplimiento / 100), 14) : 0;
    if (fillW > 0) {
      doc.setFillColor(...GREEN_SOLID);
      doc.roundedRect(margin, y, fillW, barH, 7, 7, 'F');
    }
    y += barH + 32;

    // ── Gráfica: estado de informes por mes (barras horizontales apiladas) ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...TEXT);
    doc.text('Estado de informes por mes', margin, y);
    y += 18;

    const monthStats = mesesUnicos.map((m) => {
      const rs = instructorReports.filter(r => r.month === m);
      return {
        month: m,
        aprobado: rs.filter(r => r.status === 'Aprobado').length,
        pendiente: rs.filter(r => r.status === 'Pendiente').length,
        corregir: rs.filter(r => r.status === 'A Corregir').length,
        total: rs.length,
      };
    });

    const chartLabelW = 110;
    const chartBarMaxW = pageWidth - margin * 2 - chartLabelW - 30;
    const rowH = 20;
    const maxTotal = Math.max(...monthStats.map(m => m.total), 1);

    monthStats.forEach((m) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...TEXT);
      doc.text(m.month, margin, y + 12);

      let bx = margin + chartLabelW;
      doc.setFillColor(238, 240, 244);
      doc.rect(bx, y + 3, chartBarMaxW, rowH - 8, 'F');
      [
        { count: m.aprobado, color: GREEN_SOLID },
        { count: m.pendiente, color: GOLD_SOLID },
        { count: m.corregir, color: ORANGE_SOLID },
      ].forEach((seg) => {
        if (seg.count > 0) {
          const w = (seg.count / maxTotal) * chartBarMaxW;
          doc.setFillColor(...seg.color);
          doc.rect(bx, y + 3, w, rowH - 8, 'F');
          bx += w;
        }
      });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(String(m.total), margin + chartLabelW + chartBarMaxW + 8, y + 12);

      y += rowH;
    });

    y += 6;
    let lx = margin;
    [
      { label: 'Aprobado', color: GREEN_SOLID },
      { label: 'Pendiente', color: GOLD_SOLID },
      { label: 'A corregir', color: ORANGE_SOLID },
    ].forEach((l) => {
      doc.setFillColor(...l.color);
      doc.roundedRect(lx, y - 7, 9, 9, 2, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(l.label, lx + 13, y);
      lx += doc.getTextWidth(l.label) + 36;
    });

    y += 28;

    // ── Tabla de detalle cronológico ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...TEXT);
    doc.text('Detalle cronológico', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin, bottom: 40 },
      head: [['Período', 'Tipo', 'Fecha envío', 'Estado', 'Archivo', 'Observación']],
      body: instructorReports.map(r => [r.month, r.type, r.date, r.status, r.fileName, r.observacion || '—']),
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 6, textColor: TEXT, lineColor: BORDER, lineWidth: 0.5, valign: 'middle' },
      headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: BG_ALT },
      columnStyles: {
        0: { cellWidth: 66 },
        1: { cellWidth: 30 },
        2: { cellWidth: 58 },
        3: { cellWidth: 54 },
        4: { cellWidth: 110 },
        5: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const status = data.cell.raw;
          if (status === 'Aprobado') { data.cell.styles.textColor = GREEN; data.cell.styles.fontStyle = 'bold'; }
          else if (status === 'Pendiente') { data.cell.styles.textColor = GOLD; data.cell.styles.fontStyle = 'bold'; }
          else { data.cell.styles.textColor = ORANGE; data.cell.styles.fontStyle = 'bold'; }
        }
      },
      didDrawPage: () => {
        const h = doc.internal.pageSize.getHeight();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text('SENA — Sistema de Información y Trazabilidad del Instructor', margin, h - 20);
        doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin, h - 20, { align: 'right' });
      },
    });

    doc.save(`Reporte_Historico_${instructorName.replace(/\s+/g, '_')}.pdf`);
    showToast(`Reporte histórico de ${instructorName} generado`);
  };

  const tabs = [
    { label: 'Todos',        count: reports.length },
    { label: 'Pendientes',   count: reports.filter(r => r.status === 'Pendiente').length },
    { label: 'Aprobados',    count: reports.filter(r => r.status === 'Aprobado').length },
    { label: 'A Corregir',   count: reports.filter(r => r.status === 'A Corregir').length },
  ];

  // Reportes visibles según pestaña de estado y búsqueda (se usa tanto en
  // Vista Lista como para construir el árbol de carpetas)
  const statusAndSearchFiltered = useMemo(() => reports.filter((r) => {
    const matchSearch = r.instructor.toLowerCase().includes(searchTerm.toLowerCase()) || r.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === 'Todos'      ? true :
      filterStatus === 'Pendientes' ? r.status === 'Pendiente' :
      filterStatus === 'Aprobados'  ? r.status === 'Aprobado'  :
      r.status === 'A Corregir';
    return matchSearch && matchStatus;
  }), [reports, searchTerm, filterStatus]);

  const filtered = statusAndSearchFiltered;

  const hasActiveFilters = searchTerm.trim() !== '';

  const clearFilters = () => {
    setSearchTerm('');
  };

  // ── Árbol de carpetas: Instructor -> Mes -> Informes ──────────────────────
  // Se construye automáticamente a partir de "reports": en cuanto llega un
  // informe nuevo (nuevo instructor o nuevo mes) desde el backend, aparece
  // aquí solo, sin tocar código.
  const folderTree = useMemo(() => {
    const tree = {};
    statusAndSearchFiltered.forEach((r) => {
      if (!tree[r.instructor]) tree[r.instructor] = {};
      if (!tree[r.instructor][r.month]) tree[r.instructor][r.month] = [];
      tree[r.instructor][r.month].push(r);
    });
    return tree;
  }, [statusAndSearchFiltered]);

  const instructorFolders = useMemo(() => {
    return Object.keys(folderTree).sort((a, b) => a.localeCompare(b, 'es'));
  }, [folderTree]);

  const monthFoldersForInstructor = useMemo(() => {
    if (!openInstructor || !folderTree[openInstructor]) return [];
    const months = Object.keys(folderTree[openInstructor]);
    return months.sort((a, b) => {
      const pa = parseMonthValue(a);
      const pb = parseMonthValue(b);
      if (pa.year !== pb.year) return (pb.year || 0) - (pa.year || 0);
      return pb.index - pa.index;
    });
  }, [folderTree, openInstructor]);

  // Si la búsqueda o los filtros de estado hacen que el instructor/mes abierto
  // deje de existir, regresamos automáticamente al nivel anterior.
  useEffect(() => {
    if (openInstructor && !folderTree[openInstructor]) {
      setOpenInstructor(null);
      setOpenMonth(null);
    } else if (openInstructor && openMonth && !folderTree[openInstructor]?.[openMonth]) {
      setOpenMonth(null);
    }
  }, [folderTree, openInstructor, openMonth]);

  const instructorInitials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const instructorColorFor = (name) => {
    const rep = Object.values(folderTree[name] || {})[0]?.[0];
    return { color: rep?.color || 'var(--sena-blue)', bg: rep?.bg || 'var(--sena-blue-bg)' };
  };

  return (
    <div data-sena-theme={isDark ? 'dark' : 'light'} style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: 'var(--text-primary)' }}>
      <ThemeVars />

      <Toast toast={toast} />

      <ReviewModal
        report={reviewingReport}
        onClose={() => setReviewingReport(null)}
        onApprove={handleApprove}
        onCorrect={handleCorrect}
        onDownload={handleDownload}
      />

      {/* Banner */}
      <div className="coord-banner" style={{
        background: 'linear-gradient(135deg, var(--sena-green-solid) 0%, var(--sena-green-strong) 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={17} strokeWidth={2.25} /></div>
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Validación de Documentos</span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Gestión de Informes</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Revisa, aprueba o solicita correcciones en los informes de instructores</p>
      </div>

      {/* Search + Filtros por mes e instructor (aplican a ambas vistas) */}
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Buscar por instructor o tipo de informe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 12px 10px 38px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, background: 'var(--surface-alt)', outline: 'none', color: 'var(--text-secondary)' }}
          />
        </div>

        {viewMode === 'lista' && hasActiveFilters && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--surface-muted)', color: 'var(--text-secondary)',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <X size={13} strokeWidth={2.25} /> Limpiar búsqueda
            </button>
          </div>
        )}
      </div>

      {/* Toggle de vista + Tabs de estado */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => {
            const ts = TAB_STYLES[t.label];
            const isActive = filterStatus === t.label;
            return (
              <button key={t.label} onClick={() => setFilterStatus(t.label)} style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', transition: 'all .15s',
                background: isActive ? ts.active.bg : 'var(--surface)',
                color: isActive ? ts.active.color : 'var(--text-muted)',
                border: isActive ? `1px solid ${ts.active.border}` : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              }}>
                {t.label}
                <span style={{
                  padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--surface-muted)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                }}>{t.count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-muted)', borderRadius: 10, padding: 4 }}>
          {[
            { key: 'carpetas', label: 'Carpetas', Icon: LayoutGrid },
            { key: 'lista',    label: 'Lista', Icon: List },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => { setViewMode(v.key); setOpenInstructor(null); setOpenMonth(null); }}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 600,
                background: viewMode === v.key ? 'var(--surface)' : 'transparent',
                color: viewMode === v.key ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === v.key ? 'var(--shadow-sm)' : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            ><v.Icon size={13} strokeWidth={2.25} /> {v.label}</button>
          ))}
        </div>
      </div>

      {/* Contenido: Vista Carpetas o Vista Lista */}
      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Loader2 size={16} strokeWidth={2.25} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Cargando informes desde la base de datos...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '16px 20px', background: 'var(--sena-orange-bg)', border: '1px solid var(--sena-orange-border)', borderRadius: 14, color: 'var(--sena-orange)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><AlertTriangle size={15} strokeWidth={2.25} /> Conexión con el servidor offline:</div>
          <div>{error}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mostrando datos locales de respaldo. Puedes reintentar la conexión si el backend está activo.</div>
          <button type="button" onClick={loadReports} style={{ alignSelf: 'flex-start', padding: '6px 12px', background: 'var(--sena-orange-solid)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={13} strokeWidth={2.25} /> Reintentar Conexión</button>
        </div>
      ) : viewMode === 'lista' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-soft)' }}>
              No se encontraron informes{hasActiveFilters ? ' con los filtros seleccionados.' : '.'}
            </div>
          ) : filtered.map((r) => (
            <ReportRow key={r.id} r={r} onDownload={handleDownload} onOpen={setReviewingReport} />
          ))}
        </div>
      ) : (
        <div>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setOpenInstructor(null); setOpenMonth(null); }}
              style={{
                border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px',
                fontWeight: !openInstructor ? 700 : 500,
                color: !openInstructor ? 'var(--sena-green)' : 'var(--text-muted)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            ><FolderClosed size={13} strokeWidth={2.25} /> Instructores</button>
            {openInstructor && (
              <>
                <span style={{ color: 'var(--text-faint)' }}>›</span>
                <button
                  onClick={() => setOpenMonth(null)}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px',
                    fontWeight: !openMonth ? 700 : 500,
                    color: !openMonth ? 'var(--sena-green)' : 'var(--text-muted)',
                  }}
                >{openInstructor}</button>
              </>
            )}
            {openInstructor && openMonth && (
              <>
                <span style={{ color: 'var(--text-faint)' }}>›</span>
                <span style={{ fontWeight: 700, color: 'var(--sena-green)' }}>{openMonth}</span>
              </>
            )}
          </div>

          {/* Nivel 1: carpetas de instructores */}
          {!openInstructor && (
            instructorFolders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-soft)' }}>
                No hay informes que coincidan con la búsqueda o el estado seleccionado.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {instructorFolders.map((name) => {
                  const monthsCount = Object.keys(folderTree[name]).length;
                  const reportsCount = Object.values(folderTree[name]).reduce((sum, arr) => sum + arr.length, 0);
                  const { color, bg } = instructorColorFor(name);
                  return (
                    <FolderCard
                      key={name}
                      label={name}
                      sublabel={`${monthsCount} mes${monthsCount === 1 ? '' : 'es'} · ${reportsCount} informe${reportsCount === 1 ? '' : 's'}`}
                      count={reportsCount}
                      color={color}
                      bg={bg}
                      onClick={() => { setOpenInstructor(name); setOpenMonth(null); }}
                    />
                  );
                })}
              </div>
            )
          )}

          {/* Nivel 2: carpetas de meses dentro del instructor */}
          {openInstructor && !openMonth && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                onClick={() => generateInstructorHistory(openInstructor)}
                style={{
                  padding: '9px 16px', borderRadius: 10, border: '1px solid var(--sena-blue-border)',
                  background: 'var(--sena-blue-bg)', color: 'var(--sena-blue)', fontSize: 12.5,
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                <BarChart3 size={14} strokeWidth={2.25} /> Generar Reporte Histórico (PDF)
              </button>
            </div>
          )}
          {openInstructor && !openMonth && (
            monthFoldersForInstructor.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-soft)' }}>
                Este instructor no tiene informes con los filtros actuales.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {monthFoldersForInstructor.map((month) => {
                  const monthReports = folderTree[openInstructor][month];
                  const pendientes = monthReports.filter(r => r.status === 'Pendiente' || r.status === 'A Corregir').length;
                  return (
                    <FolderCard
                      key={month}
                      label={month}
                      sublabel={pendientes > 0 ? `${pendientes} por revisar` : 'Todo al día'}
                      count={monthReports.length}
                      color={pendientes > 0 ? 'var(--sena-orange)' : 'var(--sena-green)'}
                      bg={pendientes > 0 ? 'var(--sena-orange-bg)' : 'var(--sena-green-bg)'}
                      onClick={() => setOpenMonth(month)}
                    />
                  );
                })}
              </div>
            )
          )}

          {/* Nivel 3: informes dentro del mes del instructor */}
          {openInstructor && openMonth && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(folderTree[openInstructor]?.[openMonth] || []).map((r) => (
                <ReportRow key={r.id} r={r} onDownload={handleDownload} onOpen={setReviewingReport} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}