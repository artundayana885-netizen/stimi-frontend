import { useState } from 'react';

// Datos alineados con las mismas áreas usadas en Reportes
const areas = [
  {
    name: 'TIC', instructors: 18, value: 90, color: '#6366f1',
    people: [
      { name: 'Ana Jiménez', value: 100 },
      { name: 'Miguel Torres', value: 96 },
      { name: 'Julián Perdomo', value: 91 },
      { name: 'Camila Rojas', value: 84 },
    ],
  },
  {
    name: 'PAE', instructors: 12, value: 93, color: '#22c55e',
    people: [
      { name: 'Laura Jiménez', value: 98 },
      { name: 'María González', value: 95 },
      { name: 'Diego Salazar', value: 89 },
    ],
  },
  {
    name: 'GEA', instructors: 9, value: 85, color: '#f97316',
    people: [
      { name: 'Carlos Rodríguez', value: 92 },
      { name: 'Paola Medina', value: 83 },
      { name: 'Andrés Vargas', value: 79 },
    ],
  },
  {
    name: 'Bioconstrucción', instructors: 6, value: 94, color: '#a855f7',
    people: [
      { name: 'Sofía Ramírez', value: 99 },
      { name: 'Esteban Cruz', value: 90 },
    ],
  },
];

// Histórico mensual 2026 (mes actual: julio)
const monthly = [
  { month: 'Julio 2026', value: 89, current: true },
  { month: 'Junio 2026', value: 97 },
  { month: 'Mayo 2026', value: 93 },
  { month: 'Abril 2026', value: 93 },
  { month: 'Marzo 2026', value: 95 },
  { month: 'Febrero 2026', value: 92 },
  { month: 'Enero 2026', value: 94 },
];

const MONTHS_COLLAPSED = 4;

function AreaDetailsModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: 'min(560px, 100%)',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Detalle de Cumplimiento por Área</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Desglose por instructor</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {areas.map((a) => (
            <div key={a.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{a.name}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{a.instructors} instructores</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{a.value}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {a.people.map((p) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12.5, color: '#374151', width: 140, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <div style={{ flex: 1, height: 6, background: '#F0F2F5', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.value}%`, background: a.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', width: 34, textAlign: 'right' }}>{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComplianceView() {
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const visibleMonths = showFullHistory ? monthly : monthly.slice(0, MONTHS_COLLAPSED);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>

      {/* Banner */}
      <div className="coord-banner" style={{
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ margin: '0 0 6px', fontSize: 13, opacity: 0.85, fontWeight: 500 }}>Seguimiento del rendimiento de todos los instructores</p>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Cumplimiento General</h1>
      </div>

      {/* Top Stats */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Cumplimiento Global', value: '89%', icon: '🎯', accent: '#22c55e', bg: 'linear-gradient(135deg, #22c55e, #16a34a)' },
          { label: 'Total Instructores', value: '45', icon: '👥', accent: '#6366f1', bg: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
          { label: 'Informes al Día', value: '38', icon: '✅', accent: '#0ea5e9', bg: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
        ].map((s) => (
          <div key={s.label} style={{
            borderRadius: 14, padding: '22px 20px', color: '#fff', position: 'relative', overflow: 'hidden',
            background: s.bg,
          }}>
            <div style={{ position: 'absolute', right: -10, top: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Cumplimiento por Área */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Cumplimiento por Área</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Rendimiento de cada área técnica</div>
          </div>
          {areas.map((a) => (
            <div key={a.name} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{a.name}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>{a.instructors} Instructores</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{a.value}%</span>
              </div>
              <div style={{ height: 8, background: '#F0F2F5', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${a.value}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
          <button onClick={() => setShowAreaModal(true)} style={{
            width: '100%', marginTop: 4, padding: '10px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            → Ver Detalles Completos
          </button>
        </div>

        {/* Evolución Mensual */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Evolución Mensual</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Histórico de cumplimiento</div>
          </div>
          {visibleMonths.map((m) => (
            <div key={m.month} style={{
              padding: '14px 16px', borderRadius: 12, marginBottom: 10,
              background: m.current ? '#F0FDF4' : '#F7F9FC',
              border: m.current ? '1px solid #BBF7D0' : '1px solid transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: m.current ? '#16a34a' : '#E8ECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    📅
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{m.month}</div>
                    {m.current && <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>Mes actual</div>}
                  </div>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>{m.value}%</span>
              </div>
              <div style={{ height: 6, background: m.current ? '#BBF7D0' : '#E8ECF0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.value}%`, background: m.current ? 'linear-gradient(90deg, #22c55e, #16a34a)' : '#6366f1', borderRadius: 3 }} />
              </div>
            </div>
          ))}
          {monthly.length > MONTHS_COLLAPSED && (
            <button onClick={() => setShowFullHistory(v => !v)} style={{
              width: '100%', marginTop: 4, padding: '10px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>
              📅 {showFullHistory ? 'Ver Menos' : 'Ver Historial Completo'}
            </button>
          )}
        </div>
      </div>

      {showAreaModal && <AreaDetailsModal onClose={() => setShowAreaModal(false)} />}
    </div>
  );
}
