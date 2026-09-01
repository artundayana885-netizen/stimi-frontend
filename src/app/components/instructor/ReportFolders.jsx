import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTheme } from '../../../ThemeContext';
import { getReports, downloadReportFile, deleteReport } from '../../../services/reportsService';
import FilePreviewModal from './FilePreviewModal';

/* ============================================================================
   ReportFolders
   ----------------------------------------------------------------------------
   Agrupa automáticamente, por mes, los informes que el instructor ya envió
   con createReport(). No inventa nada: usa exactamente los campos que ya
   guardas hoy → { type, fileName, status, instructor, date: 'MM/YYYY' }.

   ⚠️ ÚNICO SUPUESTO — AJUSTA SI HACE FALTA
   -----------------------------------------
   No tengo el "hermano" de lectura de createReport(), así que asumo que
   services/reportsService.js exporta:

       export async function getReports() { ... }   // devuelve TODOS los informes

   y aquí filtro por instructor en el cliente, comparando con el nombre
   guardado en localStorage('sena_user'), tal como hace ReportGC/ReportGF.

   Si tu función se llama distinto o ya filtra por instructor en el backend,
   solo ajusta la línea del import y la llamada dentro de fetchReports() —
   el resto del componente no cambia.
   ========================================================================= */

// ── Íconos de línea, mismo trazo que el resto de la app ───────────────────
const IconFileText = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" />
  </svg>
);
const IconWallet = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
    <path d="M21 12h-4a2 2 0 0 0 0 4h4v-4Z" /><path d="M3 7l4-4h9" />
  </svg>
);
const IconChevron = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: p?.open ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 15} height={p?.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const IconEye = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 14} height={p?.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconAlert = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="9" />
  </svg>
);
const IconDownload = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 14} height={p?.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconTrash = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 14} height={p?.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// El status real que devuelve el backend es 'Pendiente' / 'Aprobado' / 'A Corregir'
// (igual que en el panel del coordinador, ver STATUS_STYLES en ReportManagement.jsx).
const STATUS_META = {
  Aprobado: { label: 'Aprobado', color: '#39A900', bg: 'rgba(57,169,0,0.12)' },
  Pendiente: { label: 'Pendiente', color: '#D97706', bg: 'rgba(217,119,6,0.12)' },
  'A Corregir': { label: 'A Corregir', color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
};
const statusMeta = (s) => STATUS_META[s] || STATUS_META.Pendiente;

function folderStatus(items) {
  if (items.some((i) => i.status === 'A Corregir')) return 'A Corregir';
  if (items.some((i) => i.status === 'Pendiente')) return 'Pendiente';
  return 'Aprobado';
}

// 'date' viene como 'MM/YYYY' — la convertimos a un Date real para poder
// ordenar carpetas y armar la etiqueta "Agosto 2026".
function parseMonthYear(dateStr) {
  const [mm, yyyy] = String(dateStr || '').split('/');
  const monthIdx = Math.max(0, Math.min(11, parseInt(mm, 10) - 1 || 0));
  const year = parseInt(yyyy, 10) || new Date().getFullYear();
  return new Date(year, monthIdx, 1);
}
function monthLabel(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
function currentUserName() {
  try {
    const saved = localStorage.getItem('sena_user');
    if (saved) return JSON.parse(saved).name || 'Instructor';
  } catch (e) { /* noop */ }
  return 'Instructor';
}

export default function ReportFolders({ onOpenReport, refreshKey }) {
  const { colors, theme } = useTheme();
  const [openKey, setOpenKey] = useState(null);
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null); // id del informe con una acción (ver/descargar/eliminar) en curso
  const [preview, setPreview] = useState(null); // { file, url } para FilePreviewModal

  const showToast = (msg, color = '#16a34a') => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  const fetchReports = useCallback(async () => {
    setStatus('loading');
    try {
      const all = await getReports();
      const mine = (all || []).filter((r) => r.instructor === currentUserName());
      setReports(mine);
      setStatus('ready');
    } catch (err) {
      console.error('No se pudieron cargar los informes:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports, refreshKey]);

  // Trae el archivo real guardado en el backend y lo abre en el visor
  // (mismo modal que usan ReportGC/ReportGF antes de enviar).
  const handleView = async (report) => {
    setBusyId(report.id);
    try {
      const blob = await downloadReportFile(report.id);
      const name = report.fileName || `informe_${report.id}.pdf`;
      const file = new File([blob], name, { type: blob.type });
      setPreview({ file, url: URL.createObjectURL(file) });
    } catch (err) {
      if (err?.status === 404) {
        showToast('Este informe no tiene un archivo original guardado en el servidor.', '#D97706');
      } else {
        showToast(err.message || 'Error al abrir el archivo', '#ef4444');
      }
    } finally {
      setBusyId(null);
    }
  };

  const closePreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const handleDownload = async (report) => {
    setBusyId(report.id);
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
        showToast('Este informe no tiene un archivo original guardado en el servidor.', '#D97706');
      } else {
        showToast(err.message || 'Error al descargar el archivo', '#ef4444');
      }
    } finally {
      setBusyId(null);
    }
  };

  // Solo se puede eliminar mientras el informe sigue Pendiente (aún no lo
  // revisó el coordinador). Al eliminarlo aquí, también desaparece del
  // panel del coordinador porque ambos leen la misma tabla `informe` del
  // backend — no hace falta ningún paso adicional.
  const handleDelete = async (report) => {
    if (report.status !== 'Pendiente') return;
    const ok = window.confirm(`¿Eliminar el informe ${report.type} de ${report.date}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    setBusyId(report.id);
    try {
      await deleteReport(report.id);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      showToast('Informe eliminado');
    } catch (err) {
      showToast(err.message || 'Error al eliminar el informe', '#ef4444');
    } finally {
      setBusyId(null);
    }
  };

  const groups = useMemo(() => {
    const map = new Map();
    reports.forEach((r) => {
      const key = r.date; // 'MM/YYYY' ya es una llave de mes perfecta
      if (!map.has(key)) map.set(key, { key, date: parseMonthYear(r.date), items: [] });
      map.get(key).items.push(r);
    });

    // Carpeta "fantasma" del mes actual — muestra que se crea sola al subir el primer informe.
    const now = new Date();
    const curKey = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    if (!map.has(curKey)) {
      map.set(curKey, { key: curKey, date: new Date(now.getFullYear(), now.getMonth(), 1), items: [], ghost: true });
    }

    return Array.from(map.values()).sort((a, b) => b.date - a.date);
  }, [reports]);

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.trim().toLowerCase();
    return groups.filter((g) => monthLabel(g.date).toLowerCase().includes(q));
  }, [groups, query]);

  const isDark = theme === 'dark';
  const kraft = isDark ? '#3a2f1f' : '#F3E4C4';
  const kraftFront = isDark ? '#4a3c26' : '#FBF0D9';
  const kraftEdge = isDark ? '#5c4b2e' : '#E4CE9C';
  const tabInk = isDark ? '#E9D9AF' : '#7A5C1E';

  return (
    <div style={{ marginTop: 40 }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}
      {preview && <FilePreviewModal file={preview.file} fileUrl={preview.url} onClose={closePreview} />}
      <style>{`
        @keyframes folderRise { from { opacity:0; transform:translateY(14px) scale(.97);} to { opacity:1; transform:translateY(0) scale(1);} }
        @keyframes paperSlide { from { opacity:0; transform:translateY(6px);} to { opacity:1; transform:translateY(0);} }
        @keyframes stampPop { 0%{transform:scale(0) rotate(-14deg);opacity:0;} 60%{transform:scale(1.15) rotate(-14deg);opacity:1;} 100%{transform:scale(1) rotate(-14deg);opacity:1;} }
        @keyframes shimmer { 0%{background-position:-200px 0;} 100%{background-position:calc(200px + 100%) 0;} }
        .rf-folder { animation: folderRise .45s cubic-bezier(.2,.8,.2,1) backwards; }
        .rf-folder .rf-front { transition: transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s ease; transform-origin: bottom center; }
        .rf-folder:hover .rf-front { transform: rotateX(-18deg) translateY(-3px); box-shadow: 0 14px 22px rgba(0,0,0,0.18); }
        .rf-folder:hover .rf-paper { transform: translateY(-5px); }
        .rf-folder.rf-ghost .rf-front { border-style: dashed; }
        .rf-paper { transition: transform .28s cubic-bezier(.2,.8,.2,1); }
        .rf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 22px 18px; }
        .rf-row { animation: paperSlide .3s ease backwards; }
        .rf-search:focus { outline: none; border-color: #39A900 !important; box-shadow: 0 0 0 3px rgba(57,169,0,0.15); }
        .rf-btn-ver:hover { background: #2d8400 !important; }
        .rf-skel { border-radius: 14px; background: linear-gradient(90deg, ${isDark ? '#1e2530' : '#eef0f3'} 0px, ${isDark ? '#2a3341' : '#f8f9fb'} 40px, ${isDark ? '#1e2530' : '#eef0f3'} 80px); background-size: 600px; animation: shimmer 1.4s infinite linear; }
        @media (max-width: 480px) { .rf-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px 12px; } }
      `}</style>

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text }}>Mis Informes</h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#39A900', background: isDark ? '#14351a' : '#DCFCE7', border: `1px solid ${isDark ? '#1F4A2E' : '#bbf7d0'}`, borderRadius: 999, padding: '2px 9px' }}>
              Organización automática
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
            Cada mes se archiva solo — sube tu informe y su carpeta aparece aquí.
          </p>
        </div>

        {status === 'ready' && (
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>
              <IconSearch />
            </span>
            <input
              className="rf-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar mes…"
              style={{ padding: '9px 12px 9px 34px', borderRadius: 10, border: `1.5px solid ${colors.border}`, background: colors.card, color: colors.text, fontSize: 13, width: 190, transition: 'border-color .15s, box-shadow .15s' }}
            />
          </div>
        )}
      </div>

      {/* Estado: cargando */}
      {status === 'loading' && (
        <div className="rf-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rf-skel" style={{ height: 118, animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      )}

      {/* Estado: error */}
      {status === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: isDark ? 'rgba(220,38,38,0.1)' : '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 12, padding: '14px 18px', fontSize: 13 }}>
          <IconAlert />
          <span style={{ flex: 1 }}>No pudimos cargar tus informes. Verifica tu conexión e inténtalo de nuevo.</span>
          <button onClick={fetchReports} style={{ fontWeight: 700, color: '#DC2626', background: 'transparent', border: '1.5px solid #FECACA', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12.5 }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Grilla de carpetas */}
      {status === 'ready' && (
        <div className="rf-grid">
          {filtered.map((g, idx) => {
            const st = g.items.length ? folderStatus(g.items) : null;
            const meta = st ? statusMeta(st) : null;
            const isOpen = openKey === g.key;
            const gc = g.items.filter((i) => i.type === 'GC').length;
            const gf = g.items.filter((i) => i.type === 'GF').length;

            return (
              <button
                key={g.key}
                className={`rf-folder ${g.ghost ? 'rf-ghost' : ''}`}
                style={{ animationDelay: `${idx * 45}ms`, background: 'none', border: 'none', padding: 0, cursor: g.ghost ? 'default' : 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}
                onClick={() => !g.ghost && setOpenKey(isOpen ? null : g.key)}
                disabled={g.ghost}
              >
                <div style={{ position: 'relative', height: 118, perspective: 600 }}>
                  {/* papeles que asoman, uno por informe (máx. 3) */}
                  {!g.ghost && g.items.slice(0, 3).map((_, i) => (
                    <div key={i} className="rf-paper" style={{ position: 'absolute', left: 10 + i * 3, right: 10 - i * 3, top: 6 - i * 3, height: 60, background: isDark ? '#1c2430' : '#fff', border: `1px solid ${colors.border}`, borderRadius: '4px 4px 0 0', zIndex: i }} />
                  ))}

                  {/* cuerpo de la carpeta */}
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, zIndex: 5, background: g.ghost ? 'transparent' : kraft, borderRadius: '4px 12px 10px 10px', border: `1.5px ${g.ghost ? 'dashed' : 'solid'} ${g.ghost ? colors.border : kraftEdge}` }}>
                    <div style={{ position: 'absolute', top: -14, left: 14, width: '58%', height: 16, background: g.ghost ? 'transparent' : kraft, border: g.ghost ? `1.5px dashed ${colors.border}` : `1.5px solid ${kraftEdge}`, borderBottom: 'none', borderRadius: '6px 6px 0 0' }} />
                  </div>

                  {/* solapa frontal */}
                  <div className="rf-front" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 68, zIndex: 6, background: g.ghost ? 'transparent' : kraftFront, borderRadius: '4px 10px 10px 10px', border: `1.5px ${g.ghost ? 'dashed' : 'solid'} ${g.ghost ? colors.border : kraftEdge}`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8px 10px', boxShadow: g.ghost ? 'none' : '0 4px 10px rgba(0,0,0,0.10)' }}>
                    {!g.ghost && meta && (
                      <span style={{ position: 'absolute', top: -10, right: 10, width: 30, height: 30, borderRadius: '50%', background: colors.card, border: `2.5px solid ${meta.color}`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, animation: 'stampPop .4s ease backwards', animationDelay: `${idx * 45 + 200}ms`, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                        {g.items.length}
                      </span>
                    )}
                    {g.ghost && (
                      <span style={{ position: 'absolute', top: -10, right: 10, width: 26, height: 26, borderRadius: '50%', border: `1.5px dashed ${colors.border}`, color: colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconPlus size={13} />
                      </span>
                    )}

                    <span style={{ fontSize: 12.5, fontWeight: 800, color: g.ghost ? colors.textMuted : tabInk, lineHeight: 1.25 }}>
                      {monthLabel(g.date)}
                    </span>
                    {!g.ghost ? (
                      <span style={{ fontSize: 10.5, color: '#8a6d2e', display: 'flex', gap: 6, marginTop: 2 }}>
                        {gc > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><IconFileText size={11} />{gc}</span>}
                        {gf > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><IconWallet size={11} />{gf}</span>}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>Se crea al subir tu primer informe</span>
                    )}
                  </div>
                </div>

                {!g.ghost && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, fontSize: 11.5, fontWeight: 600, color: colors.textMuted }}>
                    {isOpen ? 'Ocultar' : 'Ver informes'} <IconChevron open={isOpen} size={13} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Sin resultados de búsqueda */}
      {status === 'ready' && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 13, color: colors.textMuted }}>
          No encontramos carpetas para "{query}".
        </div>
      )}

      {/* Panel expandido de la carpeta seleccionada */}
      {status === 'ready' && filtered.map((g) => {
        if (openKey !== g.key || g.ghost) return null;
        return (
          <div key={`${g.key}-panel`} style={{ marginTop: 18, background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.03em' }}>
              {monthLabel(g.date)} · {g.items.length} {g.items.length === 1 ? 'informe' : 'informes'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map((r, i) => {
                const meta = statusMeta(r.status);
                const Icon = r.type === 'GC' ? IconFileText : IconWallet;
                return (
                  <div key={`${g.key}-${i}`} className="rf-row" style={{ animationDelay: `${i * 40}ms`, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: isDark ? colors.bgAlt : '#F9FAFB', border: `1px solid ${colors.border}` }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: isDark ? '#14351a' : '#DCFCE7', color: '#39A900', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.fileName || `Informe ${r.type}`}
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMuted }}>
                        {r.type === 'GC' ? 'Gestión Contractual' : 'Gestión Financiera'} · {r.date}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, borderRadius: 999, padding: '4px 10px', flexShrink: 0 }}>
                      {meta.label}
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        className="rf-btn-ver"
                        onClick={() => handleView(r)}
                        disabled={busyId === r.id}
                        title="Ver archivo"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#fff', background: '#39A900', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: busyId === r.id ? 'default' : 'pointer', opacity: busyId === r.id ? 0.6 : 1, transition: 'background .15s' }}
                      >
                        <IconEye /> Ver
                      </button>
                      <button
                        onClick={() => handleDownload(r)}
                        disabled={busyId === r.id}
                        title="Descargar"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: colors.textSecondary, background: 'transparent', border: `1.5px solid ${colors.borderStrong}`, borderRadius: 8, padding: '7px 10px', cursor: busyId === r.id ? 'default' : 'pointer', opacity: busyId === r.id ? 0.6 : 1 }}
                      >
                        <IconDownload />
                      </button>
                      {r.status === 'Pendiente' && (
                        <button
                          onClick={() => handleDelete(r)}
                          disabled={busyId === r.id}
                          title="Eliminar"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#ef4444', background: theme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 8, padding: '7px 10px', cursor: busyId === r.id ? 'default' : 'pointer', opacity: busyId === r.id ? 0.6 : 1 }}
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}