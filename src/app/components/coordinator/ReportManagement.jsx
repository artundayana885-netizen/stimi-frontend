import { useState, useEffect } from 'react';
import Toast from '../Toast';
import { getReports, updateReport } from '../../../services/reportsService';
import { useTheme } from '../../../ThemeContext';


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

// ─── Visor de PDF simulado ───────────────────────────────────────────────────
function PdfViewer({ report }) {
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
                  <span>✅</span> {ev}
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
                <div key={i} style={{ padding: '8px 12px', background: i % 2 === 0 ? '#F7F9FC' : '#fff', borderRadius: 6, marginBottom: 4, border: '1px solid #E8ECF0' }}>
                  📎 {a}
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
          <span style={{ fontSize: 16 }}>📄</span>
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
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal de revisión con visor ─────────────────────────────────────────────
const NOTIFICATION_TYPES = [
  { value: 'revision',    label: 'Revisión de Documento',  icon: '📋', color: 'var(--sena-blue)', bg: 'var(--sena-blue-bg)' },
  { value: 'faltante',    label: 'Documento Faltante',      icon: '📂', color: 'var(--sena-gold)', bg: 'var(--sena-gold-bg)' },
  { value: 'correccion',  label: 'Corrección Necesaria',    icon: '✏️',  color: 'var(--sena-orange)', bg: 'var(--sena-orange-bg)' },
  { value: 'recordatorio',label: 'Recordatorio',            icon: '🔔', color: 'var(--sena-green)', bg: 'var(--sena-green-bg)' },
  { value: 'general',     label: 'Información General',     icon: 'ℹ️',  color: 'var(--text-muted)', bg: 'var(--surface-alt)' },
];

function ReviewModal({ report, onClose, onApprove, onCorrect, onDownload }) {
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('doc'); // 'doc' | 'info'
  const [notifType, setNotifType] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  if (!report) return null;

  const selectedType = NOTIFICATION_TYPES.find(t => t.value === notifType);

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
            <button onClick={() => onDownload(report)} title="Descargar" style={{ border: 'none', background: 'var(--sena-green-bg)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, color: 'var(--sena-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⬇️</button>
            <button onClick={onClose} style={{ border: 'none', background: 'var(--surface-muted)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>

        {/* Tabs: Documento / Detalles */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 24px 0', borderBottom: '1px solid var(--border-soft)', flexShrink: 0 }}>
          {[
            { key: 'doc',  label: '📄 Ver Documento' },
            { key: 'info', label: '📝 Detalles & Acción' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? 'var(--sena-green)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--sena-green-solid)' : '2px solid transparent',
              marginBottom: -1, transition: 'all .15s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'doc' ? (
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexShrink: 0 }}>
                <div style={{ background: 'var(--sena-orange-bg)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ fontSize: 16 }}>📕</span>
                  <span style={{ fontWeight: 600, color: 'var(--sena-orange)' }}>PDF</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{report.fileName}</span>
                <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 'auto' }}>{report.filePages} páginas</span>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid var(--border)' }}>
                <PdfViewer report={report} />
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
                          <span style={{ width: 22, height: 22, borderRadius: 6, background: selectedType.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{selectedType.icon}</span>
                          <span style={{ color: selectedType.color, fontWeight: 600 }}>{selectedType.label}</span>
                        </>
                      ) : 'Selecciona un tipo'}
                    </span>
                    <span style={{ color: 'var(--text-faint)', fontSize: 12, transition: 'transform .2s', display: 'inline-block', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
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
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
                          <span style={{ fontWeight: notifType === t.value ? 700 : 500, color: notifType === t.value ? t.color : 'var(--text-secondary)' }}>{t.label}</span>
                          {notifType === t.value && <span style={{ marginLeft: 'auto', color: t.color, fontSize: 14 }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo observaciones */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Observaciones {report.status === 'A Corregir' ? '(requeridas para corrección)' : '(opcional)'}
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
              </div>

              {/* Acciones */}
              {report.status !== 'Aprobado' && (
                <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => onCorrect(report.id, note)} style={{
                    padding: '12px', borderRadius: 10, border: 'none',
                    background: 'var(--sena-orange-bg)', color: 'var(--sena-orange)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    ✏️ Solicitar Corrección
                  </button>
                  <button onClick={() => onApprove(report.id)} style={{
                    padding: '12px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, var(--sena-green-solid), var(--sena-green-strong))', color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    ✅ Aprobar Informe
                  </button>
                </div>
              )}
              {report.status === 'Aprobado' && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--sena-green-bg)', border: '1px solid var(--sena-green-border)', fontSize: 13, color: 'var(--sena-green)', fontWeight: 600, textAlign: 'center' }}>
                  ✅ Este informe ya fue aprobado
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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

  const showToast = (msg, color = '#39A900') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReports();
      setReports(data.length > 0 ? data : initialReports);
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

  const handleDownload = (report) => {
    const fileContent = `Reporte de ${report.instructor}\nTipo: ${report.type}\nPeriodo: ${report.month}\nEstado: ${report.status}\nFecha: ${report.date}\nNombre de archivo: ${report.fileName}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.fileName || 'informe.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`⬇️ Descargando ${report.fileName}...`);
  };

  const handleApprove = async (id) => {
    try {
      await updateReport(id, { type: 'GC', id_version: 1 });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Aprobado', color: 'var(--sena-green)', bg: 'var(--sena-green-bg)' } : r));

      const rep = reports.find(r => r.id === id);
      if (rep) {
        addNotification(
          'success',
          'Informe aprobado',
          `Tu informe ${rep.type} de ${rep.month} ha sido aprobado por el coordinador`
        );
      }

      showToast('✅ Informe aprobado en la base de datos');
    } catch (err) {
      showToast(`❌ Error al aprobar: ${err.message}`, '#FC7323');
    } finally {
      setReviewingReport(null);
    }
  };

  const handleCorrect = async (id, note) => {
    try {
      await updateReport(id, { type: 'GF', id_version: 1 });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'A Corregir', color: 'var(--sena-orange)', bg: 'var(--sena-orange-bg)' } : r));

      const rep = reports.find(r => r.id === id);
      if (rep) {
        addNotification(
          'alert',
          'Corrección requerida',
          `El coordinador solicitó corregir tu informe ${rep.type} de ${rep.month}${note ? ': "' + note + '"' : ''}`
        );
      }

      showToast('✏️ Corrección guardada en la base de datos' + (note ? ': ' + note.slice(0, 30) : ''), '#FC7323');
    } catch (err) {
      showToast(`❌ Error al solicitar corrección: ${err.message}`, '#FC7323');
    } finally {
      setReviewingReport(null);
    }
  };

  const tabs = [
    { label: 'Todos',        count: reports.length },
    { label: 'Pendientes',   count: reports.filter(r => r.status === 'Pendiente').length },
    { label: 'Aprobados',    count: reports.filter(r => r.status === 'Aprobado').length },
    { label: 'A Corregir',   count: reports.filter(r => r.status === 'A Corregir').length },
  ];

  const filtered = reports.filter((r) => {
    const matchSearch = r.instructor.toLowerCase().includes(searchTerm.toLowerCase()) || r.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === 'Todos'      ? true :
      filterStatus === 'Pendientes' ? r.status === 'Pendiente' :
      filterStatus === 'Aprobados'  ? r.status === 'Aprobado'  :
      r.status === 'A Corregir';
    return matchSearch && matchStatus;
  });

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
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📋</div>
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Validación de Documentos</span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Gestión de Informes</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Revisa, aprueba o solicita correcciones en los informes de instructores</p>
      </div>

      {/* Search */}
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ position: 'relative' }}>
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
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
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

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--sena-green-solid)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            <span>Cargando informes desde la base de datos...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '16px 20px', background: 'var(--sena-orange-bg)', border: '1px solid var(--sena-orange-border)', borderRadius: 14, color: 'var(--sena-orange)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>⚠️ Conexión con el servidor offline:</div>
            <div>{error}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mostrando datos locales de respaldo. Puedes reintentar la conexión si el backend está activo.</div>
            <button type="button" onClick={loadReports} style={{ alignSelf: 'flex-start', padding: '6px 12px', background: 'var(--sena-orange-solid)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none' }}>Reintentar Conexión</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-soft)' }}>
            No se encontraron informes.
          </div>
        ) : filtered.map((r) => {
          const st = STATUS_STYLES[r.status];
          const tc = TYPE_COLORS[r.type];
          return (
            <div key={r.id} style={{
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
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>📎 {r.fileName}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{r.date}</span>
              <span style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                {r.status}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleDownload(r)} title="Descargar" style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  ⬇️ Descargar
                </button>
                {r.status === 'Pendiente' && (
                  <button onClick={() => setReviewingReport(r)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--sena-green-solid)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    👁 Revisar
                  </button>
                )}
                {r.status === 'A Corregir' && (
                  <button onClick={() => setReviewingReport(r)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--sena-orange-solid)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ✏️ Ver Corrección
                  </button>
                )}
                {r.status === 'Aprobado' && (
                  <button onClick={() => setReviewingReport(r)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--sena-green-border)', background: 'var(--sena-green-bg)', color: 'var(--sena-green)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    👁 Ver Documento
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}