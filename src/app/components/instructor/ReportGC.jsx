import { useState } from 'react';

const obligations = [
  { id: 1,  title: 'Participar en procesos de inducción y reinducción',   description: 'Asistir y participar activamente en las sesiones de inducción programadas' },
  { id: 2,  title: 'Cumplir con el horario establecido',                  description: 'Cumplir con el horario de trabajo asignado según cronograma' },
  { id: 3,  title: 'Ejecutar las actividades de formación',               description: 'Desarrollar las actividades de formación según los programas establecidos' },
  { id: 4,  title: 'Registrar seguimiento de aprendices',                 description: 'Llevar registro actualizado del seguimiento a cada aprendiz' },
  { id: 5,  title: 'Evaluar aprendizaje de los aprendices',               description: 'Realizar evaluaciones periódicas del proceso de aprendizaje' },
  { id: 6,  title: 'Participar en reuniones del área',                    description: 'Asistir a las reuniones programadas por coordinación' },
  { id: 7,  title: 'Aplicar metodologías de formación',                   description: 'Implementar las metodologías apropiadas para cada programa' },
  { id: 8,  title: 'Mantener actualizado el LMS',                         description: 'Actualizar regularmente la plataforma de aprendizaje' },
  { id: 9,  title: 'Elaborar material didáctico',                         description: 'Crear y actualizar material de apoyo para la formación' },
  { id: 10, title: 'Reportar novedades de aprendices',                    description: 'Informar oportunamente sobre las novedades de los aprendices' },
  { id: 11, title: 'Participar en proyectos institucionales',             description: 'Colaborar en proyectos y actividades institucionales' },
  { id: 12, title: 'Diligenciar formatos institucionales',                description: 'Completar los formatos y documentos requeridos' },
  { id: 13, title: 'Custodiar equipos y materiales',                      description: 'Cuidar y mantener en buen estado los recursos asignados' },
  { id: 14, title: 'Atender requerimientos de coordinación',              description: 'Responder oportunamente a solicitudes de coordinación' },
  { id: 15, title: 'Mantener competencias actualizadas',                  description: 'Participar en actividades de actualización profesional' },
  { id: 16, title: 'Cumplir normatividad institucional',                  description: 'Acatar las normas y procedimientos establecidos' },
  { id: 17, title: 'Entregar informes mensuales',                         description: 'Presentar los informes requeridos dentro de los plazos establecidos' },
];

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E8ECF0', fontSize: 13, color: '#374151', background: '#F7F9FC', outline: 'none', fontFamily: 'inherit', resize: 'vertical' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' };

export default function ReportGC({ onBack }) {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('2024');
  const [obligationData, setObligationData] = useState({});
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#16a34a') => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  const handleObligationChange = (id, field, value) =>
    setObligationData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleFileChange = (id, files) => {
    if (files) {
      handleObligationChange(id, 'files', Array.from(files));
      showToast(`${files.length} archivo(s) agregado(s) a la obligación ${id}`);
    }
  };

  const handleSubmit = () => {
    if (!month || !year) { showToast('Por favor completa el mes y año del informe', '#ef4444'); return; }
    showToast('✅ Informe GC enviado exitosamente');
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
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>Informe de Gestión Contractual (GC)</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Completa el informe con las evidencias de cada obligación</p>
      </div>

      {/* Instructions */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #2563eb', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <div style={{ fontSize: 13, color: '#1d4ed8' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Para cada obligación debes:</div>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
            <li>Describir las actividades realizadas</li>
            <li>Adjuntar las evidencias correspondientes (fotos, documentos, etc.)</li>
            <li>Si no realizaste la actividad, marca la casilla y justifica el motivo</li>
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

      {/* Obligations */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', padding: '24px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Obligaciones Contractuales (17)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {obligations.map(ob => {
            const isOpen = openId === ob.id;
            const data = obligationData[ob.id] || {};
            return (
              <div key={ob.id} style={{ border: `1.5px solid ${isOpen ? '#39A900' : '#E8ECF0'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
                <button
                  onClick={() => setOpenId(isOpen ? null : ob.id)}
                  style={{ width: '100%', padding: '14px 16px', background: isOpen ? '#F0FDF4' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'background .2s' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#39A900', flexShrink: 0 }}>{ob.id}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{ob.title}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{ob.description}</div>
                  </div>
                  <span style={{ fontSize: 16, color: '#39A900', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>

                {isOpen && (
                  <div style={{ padding: '16px', borderTop: '1px solid #F0F2F5', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Checkbox */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0F2F5', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={data.notDone || false} onChange={e => {
                          const checked = e.target.checked;
                          handleObligationChange(ob.id, 'notDone', checked);
                          if (checked && !data.reason) {
                            handleObligationChange(ob.id, 'reason', 'Esta actividad no se realizó en el presente período debido a que no se presentaron las condiciones necesarias para su ejecución.');
                          }
                        }} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      Esta actividad no se realizó en este periodo
                    </label>

                    {data.notDone ? (
                      <div>
                        <label style={labelStyle}>Justificación</label>
                        <textarea rows={3} placeholder="Explica por qué no se realizó esta actividad..." value={data.reason || ''} onChange={e => handleObligationChange(ob.id, 'reason', e.target.value)} style={inputStyle} />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label style={labelStyle}>Descripción de actividades realizadas</label>
                          <textarea rows={4} placeholder="Describe las actividades realizadas para cumplir con esta obligación..." value={data.description || ''} onChange={e => handleObligationChange(ob.id, 'description', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Evidencias (Fotos, documentos, etc.)</label>
                          <label htmlFor={`file-${ob.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', border: '2px dashed #D1D5DB', borderRadius: 12, cursor: 'pointer', background: '#fff', transition: 'all .2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A900'; e.currentTarget.style.background = '#F0FDF4'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#fff'; }}
                          >
                            <span style={{ fontSize: 28, marginBottom: 8 }}>📁</span>
                            <span style={{ fontSize: 13, color: '#6B7280' }}>Haz clic para subir archivos</span>
                            <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>PDF, DOC, JPG, PNG (máx. 10MB)</span>
                            <input id={`file-${ob.id}`} type="file" multiple className="hidden" style={{ display: 'none' }} onChange={e => handleFileChange(ob.id, e.target.files)} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                          </label>
                          {data.files?.length > 0 && <div style={{ marginTop: 8, fontSize: 13, color: '#39A900', fontWeight: 600 }}>✓ {data.files.length} archivo(s) seleccionado(s)</div>}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => showToast('💾 Borrador guardado correctamente')} style={{ padding: '12px 24px', borderRadius: 12, border: '1.5px solid #39A900', background: '#fff', color: '#39A900', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          💾 Guardar Borrador
        </button>
        <button onClick={handleSubmit} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #39A900, #2d8400)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(57,169,0,0.3)' }}>
          📤 Enviar Informe
        </button>
      </div>
    </div>
  );
}