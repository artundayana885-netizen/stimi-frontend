import { useState } from 'react';

const documents = [
  { id: 'security',   name: 'Planilla de Pago de Seguridad Social', description: 'Documento que certifica el pago de aportes a seguridad social', required: true },
  { id: 'health',     name: 'Planilla de Pago de Salud y Pensión',  description: 'Comprobante de pago de aportes a salud y pensión',            required: true },
  { id: 'payment',    name: 'Comprobante de Pago',                   description: 'Soporte del pago realizado en el periodo',                    required: true },
  { id: 'dependents', name: 'Dependientes',                          description: 'Registro de personas a cargo (si aplica)',                    required: false },
  { id: 'contractor', name: 'Planilla si es Contratista',            description: 'Documentación adicional requerida para contratistas',         required: false },
];

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E8ECF0', fontSize: 13, color: '#374151', background: '#F7F9FC', outline: 'none', fontFamily: 'inherit' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' };

export default function ReportGF({ onBack }) {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('2024');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#16a34a') => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  const handleFileUpload = (docId, files) => {
    if (files) {
      setUploadedFiles(prev => ({ ...prev, [docId]: Array.from(files) }));
      showToast(`✓ Archivo(s) cargado(s) para ${documents.find(d => d.id === docId)?.name}`);
    }
  };

  const handleSubmit = () => {
    if (!month || !year) { showToast('Por favor completa el mes y año del informe', '#ef4444'); return; }
    const missing = documents.filter(d => d.required && (!uploadedFiles[d.id] || uploadedFiles[d.id].length === 0));
    if (missing.length > 0) { showToast('Por favor carga todos los documentos obligatorios', '#ef4444'); return; }
    showToast('✅ Informe GF enviado exitosamente');
    setTimeout(onBack, 1500);
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}

      <button onClick={onBack} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6B7280', padding: '8px 12px', borderRadius: 8 }}
        onMouseEnter={e => e.currentTarget.style.background = '#F0F2F5'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >← Volver</button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>Informe de Gestión Financiera (GF)</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Adjunta los comprobantes y planillas de pago correspondientes</p>
      </div>

      {/* Instructions */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #2563eb', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <div style={{ fontSize: 13, color: '#1d4ed8' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Instrucciones importantes:</div>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
            <li>Todos los documentos marcados como "Obligatorio" deben ser adjuntados</li>
            <li>Los archivos deben estar en formato PDF o imagen (JPG, PNG)</li>
            <li>Puedes descargar las plantillas oficiales haciendo clic en el botón correspondiente</li>
            <li>Verifica que todos los datos sean legibles antes de enviar</li>
          </ul>
        </div>
      </div>

      {/* General Info */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', padding: '24px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
            <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="2024" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Documentos Requeridos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {documents.map(doc => (
            <div key={doc.id} style={{ border: `1.5px solid ${uploadedFiles[doc.id]?.length ? '#39A900' : '#E8ECF0'}`, borderRadius: 14, padding: '18px', transition: 'border-color .2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#39A900' }}>{doc.name}</span>
                    {doc.required && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#FEF2F2', color: '#ef4444' }}>Obligatorio</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{doc.description}</div>
                </div>
              </div>
              <label htmlFor={`file-${doc.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px', border: '2px dashed #D1D5DB', borderRadius: 12, cursor: 'pointer', background: '#FAFAFA', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A900'; e.currentTarget.style.background = '#F0FDF4'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FAFAFA'; }}
              >
                <span style={{ fontSize: 24, marginBottom: 6 }}>📁</span>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Haz clic para subir archivo</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>PDF, JPG, PNG (máx. 10MB)</span>
                <input id={`file-${doc.id}`} type="file" multiple style={{ display: 'none' }} onChange={e => handleFileUpload(doc.id, e.target.files)} accept=".pdf,.jpg,.jpeg,.png" />
              </label>
              {uploadedFiles[doc.id]?.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#39A900', fontWeight: 600 }}>
                  ✓ {uploadedFiles[doc.id].length} archivo(s) cargado(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => showToast('💾 Borrador guardado correctamente')} style={{ padding: '12px 24px', borderRadius: 12, border: '1.5px solid #39A900', background: '#fff', color: '#39A900', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          💾 Guardar Borrador
        </button>
        <button onClick={handleSubmit} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #39A900, #2d8400)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(57,169,0,0.3)' }}>
          📤 Enviar Informe
        </button>
      </div>
    </div>
  );
}