import { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { getReports, deleteReport } from '../../../services/reportsService';

const sena     = '#39A900';
const senaDeep = '#1F6B0A';
const amber    = '#B45309';
const amberBg  = '#FFFBEB';

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

export default function UnitView({ userName }) {
  const { colors, theme } = useTheme();
  const [dbReports, setDbReports] = useState([]);

  // ── Fechas importantes: ahora inicia vacío. Agrega las tuyas desde la
  // sección correspondiente (o cárgalas manualmente en localStorage
  // bajo la clave 'sena_dates').
  const [datesList, setDatesList] = useState([]);

  const [showAllReports, setShowAllReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [toast, setToast] = useState(null);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

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

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 960;

  const showToast = (msg, color = senaDeep) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

  const eyebrow = { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: colors.textFaint };

  const S = {
    card: {
      background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, overflow: 'hidden',
      boxShadow: theme === 'dark'
        ? '0 8px 24px rgba(0,0,0,0.35), 0 2px 8px rgba(57,169,0,0.08)'
        : '0 10px 26px -6px rgba(57,169,0,0.13), 0 2px 8px rgba(180,83,9,0.05)',
    },
    badge: (color) => ({
      padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
      background: color === 'green' ? (theme === 'dark' ? 'rgba(22,163,74,0.16)' : '#EAF7E4') : (theme === 'dark' ? 'rgba(180,83,9,0.18)' : '#FEF3E2'),
      color: color === 'green' ? senaDeep : amber,
      border: `1px solid ${color === 'green' ? (theme === 'dark' ? 'rgba(22,163,74,0.3)' : '#CFEFC2') : (theme === 'dark' ? 'rgba(180,83,9,0.35)' : '#FCE0B4')}`,
      boxShadow: color === 'green' ? '0 2px 8px rgba(57,169,0,0.15)' : '0 2px 8px rgba(180,83,9,0.15)',
    }),
  };

  // ── Tarjetas de indicadores: valores en cero, listos para conectarse
  // a datos reales cuando existan informes.
  const scorecards = [
    { label: 'Informes Aprobados', value: `${dbReports.filter(r => r.status === 'Aprobado').length}/12`, delta: '', up: true,  IconEl: Icon.Check },
    { label: 'Entregas a Tiempo',  value: `${dbReports.length}/12`, delta: '', up: true,  IconEl: Icon.Clock },
    { label: 'Promedio Calidad',   value: '—', delta: '', up: true, IconEl: Icon.Star },
  ];

  // ── Informes de ejemplo eliminados. Ahora solo se muestran los
  // informes reales que existan en la base de datos.
  const mappedDb = dbReports.map(r => ({
    id: r.id,
    name: `Informe ${r.type.toUpperCase()} - ${r.month}`,
    status: r.status,
    sentDate: r.date,
    reviewedDate: r.status !== 'Pendiente' ? r.date : '—',
    color: r.status === 'Aprobado' ? 'green' : (r.status === 'A Corregir' ? 'orange' : 'orange'),
    reviewer: r.type === 'GC' ? 'Coordinador Académico' : 'Coordinador Financiero',
    size: '1.5 MB',
    comments: r.status === 'Aprobado' ? 'Aprobado sin observaciones' : (r.status === 'A Corregir' ? 'Favor revisar observaciones' : 'Pendiente de revisión'),
    fileName: r.fileName
  }));

  const displayReports = mappedDb.filter(r => !deletedIds.has(r.id));

  const reports = showAllReports ? displayReports : displayReports.slice(0, 4);

  // ── Cumplimiento mensual: ahora vacío, agrega tus propios meses aquí
  // (o conéctalo a datos reales), por ejemplo:
  // { label: 'Octubre 2024', pct: 100, current: true }
  const monthly = [];

  const rowBg = theme === 'dark' ? colors.bgAlt : '#FAFBF9';
  const urgentBorder = theme === 'dark' ? 'rgba(180,83,9,0.4)' : '#F4D9AE';

  const handleDownload = (r) => {
    showToast(`✓ Descargando "${r.fileName || r.name}"...`);
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6gogMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PiBlbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBSIEluZm9ybWU=';
    link.download = r.fileName || `${r.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const IconEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
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
            style={{ background: colors.card, borderRadius: isMobile ? '18px 18px 0 0' : 16, padding: isMobile ? 22 : 28, width: '100%', maxWidth: isMobile ? '100%' : 460, maxHeight: isMobile ? '88vh' : 'auto', overflowY: 'auto', border: `1px solid ${colors.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.28)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: theme === 'dark' ? 'rgba(57,169,0,0.12)' : '#EEF9E7', border: `1px solid ${theme === 'dark' ? 'rgba(57,169,0,0.3)' : '#D6F0C4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: senaDeep, boxShadow: '0 4px 10px rgba(57,169,0,0.16)' }}><Icon.FileText /></div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{selectedReport.name}</div>
                  <span style={S.badge(selectedReport.color)}>{selectedReport.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ border: 'none', background: 'transparent', color: colors.textFaint, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

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
              <div style={{ ...eyebrow, marginBottom: 7 }}>Comentarios</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.55, padding: '11px 14px', borderRadius: 10, background: rowBg, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${sena}` }}>
                {selectedReport.comments}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleDownload(selectedReport)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none', background: senaDeep, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <IconDownload /> Descargar
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 9, border: `1.5px solid ${colors.borderStrong}`, background: 'transparent', color: colors.textSecondary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
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
                  <ActionButton title="Ver" onClick={() => setSelectedReport(r)}><IconEye /></ActionButton>
                  <ActionButton title="Descargar" onClick={() => handleDownload(r)}><IconDownload /></ActionButton>
                  <ActionButton title="Detalles" onClick={() => setSelectedReport(r)}><IconInfo /></ActionButton>
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

      {/* Row 2: Cumplimiento Mensual */}
      <div style={{ ...S.card, padding: isMobile ? '18px' : '22px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Cumplimiento Mensual</div>
        {monthly.length === 0 ? (
          <div style={{ padding: '18px 4px', textAlign: 'center', fontSize: 12.5, color: colors.textFaint }}>
            No hay datos de cumplimiento mensual todavía.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 26 }}>
            {monthly.map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, color: colors.textSecondary, fontWeight: m.current ? 700 : 400 }}>{m.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: m.current ? senaDeep : colors.textFaint, fontVariantNumeric: 'tabular-nums' }}>{m.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: colors.border, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${m.pct}%`, borderRadius: 4, background: m.current ? sena : colors.textFaint,
                    opacity: m.current ? 1 : 0.5, transition: 'width .6s ease',
                    boxShadow: m.current ? '0 0 10px 1px rgba(57,169,0,0.55)' : 'none',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}