import { useState, useEffect } from 'react';
import FilePreviewModal from './FilePreviewModal';
import { useTheme } from '../../../ThemeContext';
import { createReport } from '../../../services/reportsService';

const CURRENT_YEAR = new Date().getFullYear();
// Años disponibles: el actual y los 3 anteriores (por si hay informes atrasados)
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

function isImageFile(file) {
  return file && /\.(jpe?g|png|gif|webp)$/i.test(file.name);
}

export default function ReportGF({ onBack }) {
  const { colors, theme } = useTheme();
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [mainFile, setMainFile] = useState(null);
  const [mainFileUrl, setMainFileUrl] = useState(null);
  const [toast, setToast] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${colors.borderStrong}`, fontSize: 13, color: colors.textSecondary, background: colors.inputBg, outline: 'none', fontFamily: 'inherit', resize: 'vertical' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 6, display: 'block' };

  // Libera la URL de vista previa cuando cambia el archivo o se desmonta el componente
  useEffect(() => {
    return () => { if (mainFileUrl) URL.revokeObjectURL(mainFileUrl); };
  }, [mainFileUrl]);

  const showToast = (msg, color = '#16a34a') => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  const handleMainFileChange = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (mainFileUrl) URL.revokeObjectURL(mainFileUrl);
      setMainFile(file);
      setMainFileUrl(URL.createObjectURL(file));
      showToast(`✓ Informe cargado: ${file.name}`);
    }
  };

  const removeMainFile = () => {
    if (mainFileUrl) URL.revokeObjectURL(mainFileUrl);
    setMainFile(null);
    setMainFileUrl(null);
  };

  const handleSubmit = async () => {
    if (!month || !year) { showToast('Por favor completa el mes y año del informe', '#ef4444'); return; }
    if (!mainFile) { showToast('Por favor carga el documento del informe GF', '#ef4444'); return; }

    let currentUserName = 'Instructor';
    try {
      const savedUser = localStorage.getItem('sena_user');
      if (savedUser) {
        currentUserName = JSON.parse(savedUser).name || 'Instructor';
      }
    } catch (e) {
      console.error(e);
    }

    try {
      await createReport({
        type: 'GF',
        id_version: 1,
        fileName: mainFile.name,
        status: 'Pendiente',
        instructor: currentUserName,
        date: `${month}/${year}`,
      }, mainFile);

      // Notificación para el coordinador
      const coordNotifs = JSON.parse(localStorage.getItem('sena_coord_notifications') || '[]');
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-CO');
      coordNotifs.unshift({
        id: Date.now(),
        title: 'Nuevo informe recibido',
        message: `${currentUserName} ha enviado el informe GF de ${month}/${year}`,
        read: false,
        type: 'info',
        date: dateStr,
        color: '#6366f1',
        bg: '#EEF2FF',
        icon: '📋'
      });
      localStorage.setItem('sena_coord_notifications', JSON.stringify(coordNotifs));

      // Historial para el coordinador
      const hist = JSON.parse(localStorage.getItem('sena_history') || '[]');
      hist.unshift({
        id: Date.now(),
        instructor: currentUserName,
        action: 'Envío de informe GF',
        type: 'GF',
        month: month,
        date: dateStr,
        time: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        by: 'Instructor',
        color: '#f97316',
        bg: '#FFF7ED',
        icon: '📋'
      });
      localStorage.setItem('sena_history', JSON.stringify(hist));

      showToast('✅ Informe GF enviado para validación');
      setTimeout(onBack, 1500);
    } catch (err) {
      showToast(`❌ Error al enviar informe: ${err.message}`, '#ef4444');
    }
  };

  const isMainImage = isImageFile(mainFile);
  const dropzoneBg = theme === 'dark' ? colors.bgAlt : '#FAFAFA';
  const successBg = theme === 'dark' ? 'rgba(57,169,0,0.12)' : '#F0FDF4';

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}

      {previewOpen && (
        <FilePreviewModal file={mainFile} fileUrl={mainFileUrl} onClose={() => setPreviewOpen(false)} />
      )}

      <button onClick={onBack} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: colors.textMuted, padding: '8px 12px', borderRadius: 8 }}
        onMouseEnter={e => e.currentTarget.style.background = colors.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >← Volver</button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>Informe de Gestión Financiera (GF)</h2>
        <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>Carga tu informe para validación</p>
      </div>

      {/* Instructions */}
      <div style={{ background: theme === 'dark' ? '#10233F' : '#EFF6FF', border: `1px solid ${theme === 'dark' ? '#1E3A6B' : '#BFDBFE'}`, borderLeft: '4px solid #2563eb', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <div style={{ fontSize: 13, color: theme === 'dark' ? '#93C5FD' : '#1d4ed8' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Instrucciones importantes:</div>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
            <li>Carga el documento del informe GF ya diligenciado</li>
            <li>El archivo debe estar en formato PDF o Word</li>
            <li>Puedes revisar el archivo con "Ver archivo" antes de enviar</li>
          </ul>
        </div>
      </div>

      {/* General Info */}
      <div style={{ background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}`, padding: '24px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Información General</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Mes del informe</label>
            <select value={month} onChange={e => setMonth(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Selecciona un mes</option>
              {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
                <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Año</label>
            <select value={year} onChange={e => setYear(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main report upload */}
      <div style={{ background: colors.card, borderRadius: 16, border: `1.5px solid ${mainFile ? '#39A900' : colors.border}`, padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Documento del Informe GF</div>
        <div style={{ fontSize: 12, color: colors.textFaint, marginBottom: 16 }}>Sube el informe completo, ya diligenciado</div>

        {!mainFile ? (
          <label htmlFor="main-file-gf" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', border: `2px dashed ${colors.borderStrong}`, borderRadius: 12, cursor: 'pointer', background: dropzoneBg, transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A900'; e.currentTarget.style.background = successBg; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.borderStrong; e.currentTarget.style.background = dropzoneBg; }}
          >
            <span style={{ fontSize: 30, marginBottom: 8 }}>📤</span>
            <span style={{ fontSize: 13, color: colors.textMuted }}>Haz clic para cargar el informe GF</span>
            <span style={{ fontSize: 11, color: colors.textFaint, marginTop: 4 }}>PDF o Word (máx. 20MB)</span>
            <input id="main-file-gf" type="file" style={{ display: 'none' }} onChange={e => handleMainFileChange(e.target.files)} accept=".pdf,.doc,.docx" />
          </label>
        ) : (
          <div>
            {isMainImage && (
              <img src={mainFileUrl} alt={mainFile.name} style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 10, border: `1px solid ${colors.borderStrong}`, marginBottom: 12, background: dropzoneBg }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#39A900', fontWeight: 600, background: successBg, padding: '10px 14px', borderRadius: 10, flexWrap: 'wrap' }}>
              📄 {mainFile.name} <span style={{ color: colors.textFaint, fontWeight: 500 }}>({(mainFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setPreviewOpen(true)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #39A900', background: 'transparent', color: '#39A900', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >👁 Ver archivo</button>
                <button onClick={removeMainFile} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #FECACA', background: theme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FEF2F2', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Quitar</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleSubmit} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #39A900, #2d8400)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(57,169,0,0.3)' }}>
          📤 Enviar para Validación
        </button>
      </div>
    </div>
  );
}
