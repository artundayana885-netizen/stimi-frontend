import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Enero',      gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Febrero',    gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Marzo',      gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Abril',      gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Mayo',       gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Junio',      gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Julio',      gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Agosto',     gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Septiembre', gc: 85,  gf: 100, overall: 92,  status: 'partial' },
  { month: 'Octubre',    gc: 100, gf: 100, overall: 100, status: 'completed' },
  { month: 'Noviembre',  gc: 0,   gf: 0,   overall: 0,   status: 'pending' },
  { month: 'Diciembre',  gc: 0,   gf: 0,   overall: 0,   status: 'pending' },
];

const chartData = monthlyData.filter(d => d.status !== 'pending').map(d => ({
  month: d.month.substring(0, 3),
  'Gestión Contractual': d.gc,
  'Gestión Financiera': d.gf,
}));

const stats = [
  { label: 'Cumplimiento Anual', value: '92%',  icon: '🎯', from: '#7c3aed', to: '#2563eb' },
  { label: 'Informes Completos', value: '20',   icon: '✅', from: '#16a34a', to: '#059669' },
  { label: 'Pendientes',         value: '2',    icon: '⏱', from: '#ea580c', to: '#d97706' },
  { label: 'Con Observaciones',  value: '1',    icon: '⚠️', from: '#ef4444', to: '#db2777' },
];

const statusConfig = {
  completed: { bg: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', border: '#bbf7d0', icon: '✅', pctColor: '#16a34a' },
  partial:   { bg: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)', border: '#fed7aa', icon: '⚠️', pctColor: '#d97706' },
  pending:   { bg: '#F9FAFB', border: '#E8ECF0',                icon: '🕐', pctColor: '#9CA3AF' },
};

export default function Compliance() {
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 60%, #db2777 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>📈</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>Análisis de Desempeño</span>
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Mi Cumplimiento</h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>Seguimiento de tu desempeño y entregas durante el año</p>
        </div>
      </div>

      {/* Congratulations */}
      <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', borderRadius: 16, border: '1px solid #bbf7d0', padding: '24px 28px', marginBottom: 24, display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(134,239,172,0.3)' }} />
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #16a34a, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 8px 20px rgba(22,163,74,0.3)' }}>🏆</div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d', marginBottom: 6 }}>¡Excelente Trabajo!</div>
          <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#374151', lineHeight: 1.7 }}>
            Mantienes un nivel de cumplimiento del <strong style={{ color: '#16a34a' }}>92%</strong> durante el año. Tu compromiso y dedicación son ejemplares. ¡Sigue así!
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', padding: '6px 14px', borderRadius: 10, fontSize: 12, color: '#374151', border: '1px solid #D1FAE5' }}>✅ Nivel: <strong style={{ marginLeft: 4 }}>Excelente</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', padding: '6px 14px', borderRadius: 10, fontSize: 12, color: '#374151', border: '1px solid #D1FAE5' }}>📅 10 meses completados</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', padding: '22px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${s.from}, ${s.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14, boxShadow: `0 4px 12px ${s.from}40` }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(135deg, ${s.from}, ${s.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', padding: '28px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Gráfico de Cumplimiento</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 24 }}>Comparativa entre Gestión Contractual y Gestión Financiera</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorGF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
            <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: 13 }} />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
            <Area type="monotone" dataKey="Gestión Contractual" stroke="#7c3aed" strokeWidth={2.5} fill="url(#colorGC)" />
            <Area type="monotone" dataKey="Gestión Financiera"  stroke="#16a34a" strokeWidth={2.5} fill="url(#colorGF)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Grid */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Cumplimiento Mensual - 2024</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {monthlyData.map(d => {
            const cfg = statusConfig[d.status];
            return (
              <div key={d.month} style={{ background: cfg.bg, borderRadius: 14, border: `1.5px solid ${cfg.border}`, padding: '16px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 16 }}>{cfg.icon}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8, paddingRight: 24 }}>{d.month}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: cfg.pctColor, marginBottom: 12 }}>{d.overall}%</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[{ label: 'GC', val: d.gc, from: '#7c3aed', to: '#2563eb' }, { label: 'GF', val: d.gf, from: '#16a34a', to: '#059669' }].map(bar => (
                    <div key={bar.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: '#6B7280' }}>{bar.label}</span>
                        <span style={{ fontWeight: 700, color: bar.from }}>{bar.val}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.6)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${bar.val}%`, background: `linear-gradient(90deg, ${bar.from}, ${bar.to})`, borderRadius: 4, transition: 'width .5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}