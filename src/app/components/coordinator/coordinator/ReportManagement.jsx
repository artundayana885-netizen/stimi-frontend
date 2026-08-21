import { useState, useEffect } from 'react';
import Toast from '../Toast';
import { getReports, updateReport } from '../../../services/reportsService';

const STATUS_STYLES = {
  Pendiente:    { bg: '#FFF7ED', color: '#c2410c', border: '#FED7AA' },
  Aprobado:     { bg: '#F0FDF4', color: '#15803d', border: '#BBF7D0' },
  'A Corregir': { bg: '#FEF2F2', color: '#b91c1c', border: '#FECACA' },
};

const TYPE_COLORS = {
  GC: { bg: '#EEF2FF', color: '#4f46e5' },
  GF: { bg: '#F5F3FF', color: '#7c3aed' },
};

const TAB_STYLES = {
  Todos:        { active: { bg: '#111827', color: '#fff', border: '#111827' } },
  Pendientes:   { active: { bg: '#f97316', color: '#fff', border: '#f97316' } },
  Aprobados:    { active: { bg: '#16a34a', color: '#fff', border: '#16a34a' } },
  'A Corregir': { active: { bg: '#ef4444', color: '#fff', border: '#ef4444' } },
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
                <div key={i} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
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
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#92400e', lineHeight: 1.7, marginBottom: 16 }}>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar del visor (sin controles de página: el documento se ve completo, con scroll) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#1f2937', borderRadius: '10px 10px 0 0',
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

      {/* Documento completo, scrolleable de corrido como un documento normal */}
      <div style={{
        flex: 1, overflowY: 'auto', background: '#374151',
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
            {/* Encabezado del doc (se repite en cada hoja, como en un documento real) */}
            <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #111827' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: 1, textTransform: 'uppercase' }}>
                Servicio Nacional de Aprendizaje — SENA
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Sistema de Información y Trazabilidad del Instructor</div>
              <div style={{ marginTop: 10, display: 'inline-block', background: TYPE_COLORS[report.type]?.bg, color: TYPE_COLORS[report.type]?.color, padding: '3px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                INFORME {report.type} — {report.month.toUpperCase()}
              </div>
            </div>

            {renderPageBody(pageNum)}

            {/* Pie del doc */}
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
  { value: 'revision',    label: 'Revisión de Documento',  icon: '📋', color: '#6366f1', bg: '#EEF2FF' },
  { value: 'faltante',    label: 'Documento Faltante',      icon: '📂', color: '#f97316', bg: '#FFF7ED' },
  { value: 'correccion',  label: 'Corrección Necesaria',    icon: '✏️',  color: '#ef4444', bg: '#FEF2F2' },
  { value: 'recordatorio',label: 'Recordatorio',            icon: '🔔', color: '#0ea5e9', bg: '#F0F9FF' },
  { value: 'general',     label: 'Información General',     icon: 'ℹ️',  color: '#6B7280', bg: '#F7F9FC' },
];

function ReviewModal({ report, onClose, onApprove, onCorrect, submitting }) {
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('doc'); // 'doc' | 'info'
  const [notifType, setNotifType] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  if (!report) return null;

  const selectedType = NOTIFICATION_TYPES.find(t => t.value === notifType);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20,
        width: 'min(820px, 100%)', height: '92vh', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header del modal */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #F0F2F5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: report.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: report.color }}>
              {report.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Revisar Informe</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{report.instructor} · {report.type} · {report.month}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Tabs: Documento / Detalles */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 24px 0', borderBottom: '1px solid #F0F2F5', flexShrink: 0 }}>
          {[
            { key: 'doc',  label: '📄 Ver Documento' },
            { key: 'info', label: '📝 Detalles & Acción' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? '#16a34a' : '#6B7280',
              borderBottom: tab === t.key ? '2px solid #16a34a' : '2px solid transparent',
              marginBottom: -1, transition: 'all .15s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'doc' ? (
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
              {/* Info del archivo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexShrink: 0 }}>
                <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ fontSize: 16 }}>📕</span>
                  <span style={{ fontWeight: 600, color: '#7f1d1d' }}>PDF</span>
                </div>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{report.fileName}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{report.filePages} páginas</span>
              </div>
              {/* Visor */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid #E8ECF0' }}>
                <PdfViewer report={report} />
              </div>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Detalles */}
              <div style={{ background: '#F7F9FC', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: '#374151', lineHeight: 1.7, border: '1px solid #E8ECF0' }}>
                <div style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>Resumen del informe</div>
                <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  <span><strong>Instructor:</strong> {report.instructor}</span>
                  <span><strong>Tipo:</strong> {report.type}</span>
                  <span><strong>Período:</strong> {report.month}</span>
                  <span><strong>Enviado:</strong> {report.date}</span>
                  <span><strong>Archivo:</strong> {report.fileName}</span>
                  <span><strong>Estado:</strong> {report.status}</span>
                </div>
              </div>

              {/* Si el informe ya tiene una observación previa guardada en el backend, la mostramos aquí */}
              {report.observacion && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
                  <strong>Última observación registrada:</strong> {report.observacion}
                </div>
              )}

              {/* ── Tipo de Notificación ── */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Tipo de Notificación
                </label>
                {/* Dropdown personalizado */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: `1.5px solid ${dropdownOpen ? '#16a34a' : '#E8ECF0'}`,
                      background: '#fff', fontSize: 13, color: selectedType ? '#111827' : '#9CA3AF',
                      cursor: 'pointer', textAlign: 'left', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: dropdownOpen ? '0 0 0 3px rgba(22,163,74,0.1)' : 'none',
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
                    <span style={{ color: '#9CA3AF', fontSize: 12, transition: 'transform .2s', display: 'inline-block', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </button>

                  {/* Opciones */}
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
                      background: '#fff', borderRadius: 12, border: '1px solid #E8ECF0',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden',
                    }}>
                      {NOTIFICATION_TYPES.map((t, i) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => { setNotifType(t.value); setDropdownOpen(false); }}
                          style={{
                            width: '100%', padding: '11px 16px', border: 'none', cursor: 'pointer',
                            background: notifType === t.value ? t.bg : i % 2 === 0 ? '#fff' : '#FAFAFA',
                            display: 'flex', alignItems: 'center', gap: 10,
                            textAlign: 'left', fontSize: 13,
                            borderBottom: i < NOTIFICATION_TYPES.length - 1 ? '1px solid #F0F2F5' : 'none',
                            transition: 'background .1s',
                          }}
                          onMouseEnter={e => { if (notifType !== t.value) e.currentTarget.style.background = t.bg; }}
                          onMouseLeave={e => { if (notifType !== t.value) e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFAFA'; }}
                        >
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
                          <span style={{ fontWeight: notifType === t.value ? 700 : 500, color: notifType === t.value ? t.color : '#374151' }}>{t.label}</span>
                          {notifType === t.value && <span style={{ marginLeft: 'auto', color: t.color, fontSize: 14 }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Campo observaciones */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Observaciones {report.status === 'A Corregir' ? '(requeridas para corrección)' : '(opcional)'}
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Escribe observaciones o motivo de corrección..."
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                    borderRadius: 10, border: '1px solid #E8ECF0', fontSize: 13,
                    color: '#374151', background: '#F7F9FC', outline: 'none',
                    resize: 'vertical', minHeight: 90, fontFamily: 'inherit',
                  }}
                />
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'right' }}>{note.length} caracteres</div>
              </div>

              {/* Acciones */}
              {report.status !== 'Aprobado' && (
                <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    disabled={submitting}
                    onClick={() => onCorrect(report.id, note)}
                    style={{
                      padding: '12px', borderRadius: 10, border: 'none',
                      background: '#FEF2F2', color: '#b91c1c', fontWeight: 700, fontSize: 13,
                      cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    ✏️ Solicitar Corrección
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => onApprove(report.id)}
                    style={{
                      padding: '12px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                      fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    ✅ Aprobar Informe
                  </button>
                </div>
              )}
              {report.status === 'Aprobado' && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 13, color: '#15803d', fontWeight: 600, textAlign: 'center' }}>
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [reviewingReport, setReviewingReport] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#16a34a') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Carga los informes reales desde el backend (antes esto era un
  // arreglo mock local `initialReports` que nunca se conectaba a la BD).
  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data || []);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar los informes', '#ef4444');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // ── Al aprobar, se persiste el cambio de estado en el backend (PATCH
  // /informe/:id) y se recarga la lista real.
  const handleApprove = async (id) => {
    setSubmitting(true);
    try {
      await updateReport(id, { status: 'Aprobado' });
      showToast('✅ Informe aprobado correctamente');
      setReviewingReport(null);
      await loadReports();
    } catch (err) {
      console.error(err);
      showToast('Error al aprobar el informe', '#ef4444');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Al solicitar corrección, se guarda el estado Y la observación real
  // que escribió el revisor (antes `note` solo se usaba para un toast y
  // se perdía; ahora viaja al backend como `observacion`).
  const handleCorrect = async (id, note) => {
    setSubmitting(true);
    try {
      await updateReport(id, { status: 'A Corregir', observacion: note });
      showToast('✏️ Corrección solicitada' + (note ? ': ' + note.slice(0, 40) : ''), '#ef4444');
      setReviewingReport(null);
      await loadReports();
    } catch (err) {
      console.error(err);
      showToast('Error al solicitar la corrección', '#ef4444');
    } finally {
      setSubmitting(false);
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
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>

      <Toast toast={toast} />

      <ReviewModal
        report={reviewingReport}
        onClose={() => setReviewingReport(null)}
        onApprove={handleApprove}
        onCorrect={handleCorrect}
        submitting={submitting}
      />

      {/* Banner */}
      <div className="coord-banner" style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📋</div>
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Validación de Documentos</span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Gestión de Informes</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Revisa, aprueba o solicita correcciones en los informes de instructores</p>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Buscar por instructor o tipo de informe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 12px 10px 38px', width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid #E8ECF0', fontSize: 14, background: '#F7F9FC', outline: 'none', color: '#374151' }}
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
              background: isActive ? ts.active.bg : '#fff',
              color: isActive ? ts.active.color : '#6B7280',
              border: isActive ? `1px solid ${ts.active.border}` : '1px solid #E8ECF0',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            }}>
              {t.label}
              <span style={{
                padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.25)' : '#F0F2F5',
                color: isActive ? '#fff' : '#6B7280',
              }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14, background: '#fff', borderRadius: 14, border: '1px solid #F0F2F5' }}>
            Cargando informes...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14, background: '#fff', borderRadius: 14, border: '1px solid #F0F2F5' }}>
            No se encontraron informes.
          </div>
        ) : filtered.map((r) => {
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.Pendiente;
          const tc = TYPE_COLORS[r.type] || TYPE_COLORS.GC;
          return (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow .15s', flexWrap: 'wrap',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: r.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: r.color }}>
                {r.initials}
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{r.instructor}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: tc.bg, color: tc.color, fontWeight: 600, fontSize: 11 }}>{r.type}</span>
                  {r.month}
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>📎 {r.fileName}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{r.date}</span>
              <span style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                {r.status}
              </span>
              {r.status === 'Pendiente' && (
                <button onClick={() => setReviewingReport(r)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  👁 Revisar
                </button>
              )}
              {r.status === 'A Corregir' && (
                <button onClick={() => setReviewingReport(r)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  ✏️ Ver Corrección
                </button>
              )}
              {r.status === 'Aprobado' && (
                <button onClick={() => setReviewingReport(r)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#16a34a', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  👁 Ver Documento
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}