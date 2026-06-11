import { useState } from 'react';

const monthlyData = [
  { month: 'Ene', gc: 95, gf: 100 }, { month: 'Feb', gc: 92, gf: 98 },
  { month: 'Mar', gc: 98, gf: 95 }, { month: 'Abr', gc: 90, gf: 96 },
  { month: 'May', gc: 94, gf: 93 }, { month: 'Jun', gc: 97, gf: 99 },
  { month: 'Jul', gc: 88, gf: 91 }, { month: 'Ago', gc: 93, gf: 95 },
  { month: 'Sep', gc: 96, gf: 97 }, { month: 'Oct', gc: 91, gf: 94 },
];

const topInstructors = [
  { name: 'María González', area: 'Coordinación · May Dueño', value: 100, initials: 'MG', color: '#6366f1', bg: '#EEF2FF' },
  { name: 'Ana Jiménez', area: 'Sistemas · May Dueño', value: 100, initials: 'AJ', color: '#22c55e', bg: '#F0FDF4' },
  { name: 'Laura Jiménez', area: 'Electrónica · May Dueño', value: 98, initials: 'LJ', color: '#f97316', bg: '#FFF7ED' },
  { name: 'Miguel Torres', area: 'Coordinación · May Torres', value: 96, initials: 'MT', color: '#8b5cf6', bg: '#F5F3FF' },
  { name: 'Carlos Rodríguez', area: 'Coordinación · May Torres', value: 94, initials: 'CR', color: '#ef4444', bg: '#FEF2F2' },
];

function BarChart({ data }) {
  const max = 100;
  const barW = 20;
  const chartH = 140;
  const totalW = data.length * (barW * 2 + 12 + 8);
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${chartH + 24}`} style={{ overflow: 'visible' }}>
      {[50, 100].map((line) => (
        <g key={line}>
          <line x1={0} y1={chartH - (line / max) * chartH} x2={totalW} y2={chartH - (line / max) * chartH} stroke="#F0F2F5" strokeWidth={1} />
          <text x={-4} y={chartH - (line / max) * chartH + 4} textAnchor="end" fontSize={9} fill="#9CA3AF">{line}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = i * (barW * 2 + 12 + 8);
        return (
          <g key={d.month}>
            <rect x={x} y={chartH - (d.gc / max) * chartH} width={barW} height={(d.gc / max) * chartH} fill="#22c55e" rx={4} />
            <rect x={x + barW + 4} y={chartH - (d.gf / max) * chartH} width={barW} height={(d.gf / max) * chartH} fill="#6366f1" rx={4} />
            <text x={x + barW} y={chartH + 14} textAnchor="middle" fontSize={9} fill="#9CA3AF">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

const areaData = [
  { name: 'ADSO', value: 38, color: '#22c55e' },
  { name: 'Redes', value: 27, color: '#6366f1' },
  { name: 'Bienestar', value: 20, color: '#f97316' },
  { name: 'Otro', value: 15, color: '#E8ECF0' },
];

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 55; const cx = 70; const cy = 70;
  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return { ...d, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        {slices.map((s) => <path key={s.name} d={s.d} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={32} fill="#fff" />
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize={14} fontWeight={700} fill="#111827">89%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#9CA3AF">General</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: '#6B7280' }}>{d.name}</span>
            <span style={{ fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const [year, setYear] = useState('2024');

  const sel = { padding: '8px 12px', borderRadius: 8, border: '1px solid #E8ECF0', fontSize: 13, background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none' };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
            <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Análisis y Estadísticas</span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Reportes y Estadísticas</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Visualiza el desempeño general de tu unidad</p>
        </div>
        <button style={{
          background: '#fff', color: '#16a34a', border: 'none',
          borderRadius: 10, padding: '10px 20px', fontWeight: 700,
          fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ⬇ Exportar Reporte
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 20, border: '1px solid #F0F2F5', display: 'flex', gap: 10, alignItems: 'center' }}>
        <select value={year} onChange={(e) => setYear(e.target.value)} style={sel}>
          <option value="2024">2024</option><option value="2023">2023</option>
        </select>
        <select style={sel}>
          <option>Todos los meses</option>
          {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map(m => <option key={m}>{m}</option>)}
        </select>
        <select style={sel}>
          <option>Todas las áreas</option><option>Sistemas</option><option>Electrónica</option>
        </select>
        <select style={sel}><option>Todos</option></select>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '👥', value: '45', label: 'Total Instructores', color: '#6366f1', bg: '#EEF2FF', trend: '↑' },
          { icon: '🎯', value: '89%', label: 'Cumplimiento General', color: '#22c55e', bg: '#F0FDF4', trend: '↑' },
          { icon: '⏰', value: '5', label: 'Informes Pendientes', color: '#f97316', bg: '#FFF7ED', trend: '↓' },
          { icon: '🚨', value: '2', label: 'Con Alertas', color: '#ef4444', bg: '#FEF2F2', trend: '↓' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px', border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <span style={{ fontSize: 18, color: s.color, fontWeight: 700 }}>{s.trend}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Cumplimiento Mensual {year}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Comparativa GC vs GF por mes</div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            {[{ color: '#22c55e', label: 'GC' }, { color: '#6366f1', label: 'GF' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                <span style={{ color: '#6B7280' }}>{l.label}</span>
              </div>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <BarChart data={monthlyData} />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Cumplimiento por Área</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Desempeño por programa</div>
          </div>
          <DonutChart data={areaData} />
        </div>
      </div>

      {/* Top instructors */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 14 }}>Mejores Instructores</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topInstructors.map((inst) => (
            <div key={inst.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: inst.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: inst.color, flexShrink: 0 }}>{inst.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{inst.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{inst.area}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180 }}>
                <div style={{ flex: 1, height: 6, background: '#F0F2F5', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${inst.value}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', minWidth: 36, textAlign: 'right' }}>{inst.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
