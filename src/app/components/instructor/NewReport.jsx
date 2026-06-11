import { useState } from 'react';
import ReportGC from './ReportGC';
import ReportGF from './ReportGF';

export default function NewReport() {
  const [selectedType, setSelectedType] = useState(null);

  if (selectedType === 'gc') return <ReportGC onBack={() => setSelectedType(null)} />;
  if (selectedType === 'gf') return <ReportGF onBack={() => setSelectedType(null)} />;

  const cardBase = {
    background: '#fff', borderRadius: 20, border: '2px solid #F0F2F5',
    padding: '36px 28px', cursor: 'pointer', transition: 'all .2s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>
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

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>Nuevo Informe</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>Selecciona el tipo de informe que deseas crear</p>
      </div>

      {/* Instructions */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #2563eb', borderRadius: 12, padding: '16px 20px', marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e40af', marginBottom: 8 }}>📋 Instrucciones</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#1d4ed8', lineHeight: 1.8 }}>
          <li>Los informes deben ser entregados entre el día 1 y 28 de cada mes</li>
          <li>Asegúrate de completar todos los campos obligatorios</li>
          <li>Adjunta todas las evidencias requeridas para cada obligación</li>
          <li>Puedes guardar tu progreso y continuar después</li>
        </ul>
      </div>

      {/* Cards */}
      <div className="nr-grid">
        {/* GC */}
        <div
          style={cardBase}
          onClick={() => setSelectedType('gc')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A900'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(57,169,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F2F5'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 18 }}>📄</div>
          <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#39A900' }}>Gestión Contractual (GC)</h3>
          <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>Informe de gestión contractual con evidencias de las 17 obligaciones establecidas</p>
          <div style={{ width: '100%', background: '#F9FAFB', borderRadius: 12, padding: '14px 16px', marginBottom: 22, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Documentos requeridos:</div>
            {['Guía de trabajo', 'Evidencias de cada obligación', 'Descripción de actividades realizadas', 'Justificación de actividades no realizadas'].map((d, i) => (
              <div key={i} style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.8 }}>• {d}</div>
            ))}
          </div>
          <button
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #39A900, #2d8400)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setSelectedType('gc'); }}
          >Crear Informe GC</button>
        </div>

        {/* GF */}
        <div
          style={cardBase}
          onClick={() => setSelectedType('gf')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A900'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(57,169,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F2F5'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 18 }}>💰</div>
          <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#39A900' }}>Gestión Financiera (GF)</h3>
          <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>Informe de gestión financiera con planillas de pago y comprobantes</p>
          <div style={{ width: '100%', background: '#F9FAFB', borderRadius: 12, padding: '14px 16px', marginBottom: 22, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Documentos requeridos:</div>
            {['Planilla de seguridad social', 'Planilla de salud y pensión', 'Comprobante de pago', 'Dependientes (si aplica)', 'Planilla si es contratista'].map((d, i) => (
              <div key={i} style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.8 }}>• {d}</div>
            ))}
          </div>
          <button
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #39A900, #2d8400)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setSelectedType('gf'); }}
          >Crear Informe GF</button>
        </div>
      </div>
    </div>
  );
}