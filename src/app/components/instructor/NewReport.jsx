import { useState } from 'react';
import ReportGC from './ReportGC';
import ReportGF from './ReportGF';
import ReportFolders from './ReportFolders';
import { useTheme } from '../../../ThemeContext';

// ── Íconos de línea, consistentes con el resto de la app ─────────────────
const IconFileText = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 32} height={p?.size || 32} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" />
  </svg>
);
const IconWallet = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 32} height={p?.size || 32} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
    <path d="M21 12h-4a2 2 0 0 0 0 4h4v-4Z" />
    <path d="M3 7l4-4h9" />
  </svg>
);
const IconClipboard = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 14} height={p?.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
    <path d="M9 12h6" /><path d="M9 16h6" /><path d="M9 8h6" />
  </svg>
);
const IconFolder = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 15} height={p?.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </svg>
);
const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 15} height={p?.size || 15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function NewReport() {
  const { colors, theme } = useTheme();
  const [selectedType, setSelectedType] = useState(null);
  const [tab, setTab] = useState('nuevo'); // 'nuevo' | 'carpetas'

  if (selectedType === 'gc') return <ReportGC onBack={() => setSelectedType(null)} />;
  if (selectedType === 'gf') return <ReportGF onBack={() => setSelectedType(null)} />;

  const cardBase = {
    background: colors.card, borderRadius: 20, border: `2px solid ${colors.border}`,
    padding: '36px 28px', cursor: 'pointer', transition: 'all .2s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  const iconBoxBg = theme === 'dark' ? 'linear-gradient(135deg, #14351a, #0f2a14)' : 'linear-gradient(135deg, #f0fdf4, #dcfce7)';
  const iconBoxBorder = theme === 'dark' ? '#1F4A2E' : '#bbf7d0';
  const infoBg = theme === 'dark' ? colors.bgAlt : '#F9FAFB';

  // ── Tabs de navegación (NO son botones de acción) ──────────────────────
  // Estilo "underline": texto + línea inferior, sin relleno sólido,
  // para que se lea claramente como cambio de vista y no como una acción
  // tipo "guardar" o "enviar".
  const tabBtn = (key, label, Icon) => {
    const active = tab === key;
    return (
      <button
        onClick={() => setTab(key)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '10px 4px', border: 'none', background: 'transparent',
          cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
          color: active ? '#39A900' : colors.textMuted,
          borderBottom: active ? '2.5px solid #39A900' : '2.5px solid transparent',
          borderRadius: 0, transition: 'all .2s',
        }}
      >
        <Icon size={14} /> {label}
      </button>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text }}>
      <style>{`
        .nr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          width: 100%;
        }
        @media (max-width: 640px) {
          .nr-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header + selector de pestañas */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>{tab === 'nuevo' ? 'Nuevo Informe' : 'Mis Informes'}</h2>
          <p style={{ margin: 0, fontSize: 14, color: colors.textMuted }}>
            {tab === 'nuevo' ? 'Selecciona el tipo de informe y carga el documento ya diligenciado' : 'Organizados automáticamente en carpetas por mes de radicación'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20, borderBottom: `1px solid ${colors.border}` }}>
          {tabBtn('nuevo', 'Nuevo informe', IconPlus)}
          {tabBtn('carpetas', 'Mis carpetas', IconFolder)}
        </div>
      </div>

      {tab === 'carpetas' ? (
        <ReportFolders />
      ) : (
        <>
          {/* Instructions */}
          <div style={{ background: theme === 'dark' ? '#10233F' : '#EFF6FF', border: `1px solid ${theme === 'dark' ? '#1E3A6B' : '#BFDBFE'}`, borderLeft: '4px solid #2563eb', borderRadius: 12, padding: '16px 20px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, color: theme === 'dark' ? '#93C5FD' : '#1e40af', marginBottom: 8 }}>
              <IconClipboard /> Instrucciones
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: theme === 'dark' ? '#93C5FD' : '#1d4ed8', lineHeight: 1.8 }}>
              <li>Los informes deben ser entregados entre el día 1 y 28 de cada mes</li>
              <li>El informe se elabora fuera de la plataforma; aquí solo lo cargas para validación</li>
              <li>Asegúrate de completar todos los campos obligatorios y adjuntar el documento principal</li>
              <li>Puedes revisar el archivo con "Ver archivo" antes de enviarlo</li>
              <li>Supervisión revisará que el informe cumpla con todos los parámetros antes de aprobarlo</li>
              <li>Cada informe se guarda automáticamente en la carpeta de su mes — puedes verlas en "Mis carpetas"</li>
            </ul>
          </div>

          {/* Cards */}
          <div className="nr-grid">
            {/* GC */}
            <div
              style={cardBase}
              onClick={() => setSelectedType('gc')}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A900'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(57,169,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 20, background: iconBoxBg, border: `1px solid ${iconBoxBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#39A900', marginBottom: 18 }}><IconFileText /></div>
              <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#39A900' }}>Gestión Contractual (GC)</h3>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>Carga tu informe de gestión contractual con evidencias de las 17 obligaciones establecidas</p>
              <div style={{ width: '100%', background: infoBg, borderRadius: 12, padding: '14px 16px', marginBottom: 22, textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>Qué debes cargar:</div>
                {['Mes y año del informe', 'Documento del informe (PDF o Word)'].map((d, i) => (
                  <div key={i} style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.8 }}>• {d}</div>
                ))}
              </div>
              <button
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #39A900, #2d8400)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); setSelectedType('gc'); }}
              >Cargar Informe GC</button>
            </div>

            {/* GF */}
            <div
              style={cardBase}
              onClick={() => setSelectedType('gf')}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A900'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(57,169,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 20, background: iconBoxBg, border: `1px solid ${iconBoxBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#39A900', marginBottom: 18 }}><IconWallet /></div>
              <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#39A900' }}>Gestión Financiera (GF)</h3>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>Carga tu informe de gestión financiera con planillas de pago y comprobantes</p>
              <div style={{ width: '100%', background: infoBg, borderRadius: 12, padding: '14px 16px', marginBottom: 22, textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>Qué debes cargar:</div>
                {['Documento del informe (PDF o Word)', 'Planilla de seguridad social', 'Planilla de salud y pensión', 'Comprobante de pago', 'Dependientes / contratista (si aplica)'].map((d, i) => (
                  <div key={i} style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.8 }}>• {d}</div>
                ))}
              </div>
              <button
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #39A900, #2d8400)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); setSelectedType('gf'); }}
              >Cargar Informe GF</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}