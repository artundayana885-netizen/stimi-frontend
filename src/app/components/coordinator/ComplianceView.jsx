const areas = [
  { name: 'TIC', instructors: 12, value: 95, color: '#22c55e' },
  { name: 'PAE', instructors: 8, value: 88, color: '#6366f1' },
  { name: 'GE', instructors: 10, value: 92, color: '#6366f1' },
  { name: 'ADSO', instructors: 15, value: 85, color: '#6366f1' },
];

const monthly = [
  { month: 'Noviembre 2024', value: 89, current: true },
  { month: 'Octubre 2024', value: 92 },
  { month: 'Septiembre 2024', value: 87 },
  { month: 'Agosto 2024', value: 90 },
];

export default function ComplianceView() {
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ margin: '0 0 6px', fontSize: 13, opacity: 0.85, fontWeight: 500 }}>Seguimiento del rendimiento de todos los instructores</p>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Cumplimiento General</h1>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

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
          <button style={{
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
          {monthly.map((m) => (
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
          <button style={{
            width: '100%', marginTop: 4, padding: '10px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            📅 Ver Historial Completo
          </button>
        </div>
      </div>
    </div>
  );
}
