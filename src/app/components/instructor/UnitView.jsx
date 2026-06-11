import { useState } from 'react';

const S = {
  card: { background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  badge: (color) => ({ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: color === 'green' ? '#DCFCE7' : color === 'orange' ? '#FEF3C7' : '#EDE9FE', color: color === 'green' ? '#16a34a' : color === 'orange' ? '#d97706' : '#7c3aed' }),
};

export default function UnitView({ userName }) {
  const stats = [
    { label: 'Cumplimiento General', value: '95%',   badge: '+5%',  from: '#16a34a', to: '#059669', bgFrom: '#F0FDF4', bgTo: '#ECFDF5', icon: '🎯' },
    { label: 'Informes Aprobados',   value: '10/12', badge: '83%',  from: '#2563eb', to: '#0891b2', bgFrom: '#EFF6FF', bgTo: '#ECFEFF', icon: '✅' },
    { label: 'Entregas a Tiempo',    value: '11/12', badge: '92%',  from: '#7c3aed', to: '#db2777', bgFrom: '#F5F3FF', bgTo: '#FDF2F8', icon: '⏱' },
    { label: 'Promedio Calidad',     value: '4.7/5', badge: '+0.3', from: '#ea580c', to: '#d97706', bgFrom: '#FFF7ED', bgTo: '#FFFBEB', icon: '⭐' },
  ];

  const reports = [
    { id: 1, name: 'Informe GC - Octubre 2024',    status: 'Aprobado',   date: '2024-10-28', color: 'green' },
    { id: 2, name: 'Informe GF - Octubre 2024',    status: 'Aprobado',   date: '2024-10-28', color: 'green' },
    { id: 3, name: 'Informe GC - Septiembre 2024', status: 'Aprobado',   date: '2024-09-29', color: 'green' },
    { id: 4, name: 'Informe GF - Septiembre 2024', status: 'A Corregir', date: '2024-09-29', color: 'orange' },
  ];

  const monthly = [
    { label: 'Noviembre 2024',  pct: 85,  from: '#7c3aed', to: '#2563eb' },
    { label: 'Octubre 2024',    pct: 100, from: '#16a34a', to: '#059669' },
    { label: 'Septiembre 2024', pct: 92,  from: '#2563eb', to: '#0891b2' },
  ];

  const dates = [
    { label: 'Fecha límite entregas mensuales', date: '28 de cada mes', urgent: true,  icon: '📅' },
    
    
    
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 60%, #db2777 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 13, opacity: 0.85 }}>Panel de Control</span>
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Mi Cumplimiento</h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>Análisis detallado de tu desempeño</p>
        </div>
      </div>

      {/* Alert */}
      <div style={{ ...S.card, background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)', border: '1px solid #C7D2FE', marginBottom: 24, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>ℹ️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Período de Carga de Informes</div>
          <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>La plataforma estará habilitada para subir informes del <strong>1 al 28 de cada mes</strong>. Asegúrate de entregar tus informes a tiempo.</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...S.card, padding: '22px 20px', background: `linear-gradient(135deg, ${s.bgFrom}, ${s.bgTo})`, border: `1px solid ${s.bgFrom}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${s.from}, ${s.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 4px 12px ${s.from}40` }}>{s.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.from, background: '#fff', padding: '3px 10px', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>↑ {s.badge}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, background: `linear-gradient(135deg, ${s.from}, ${s.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Informes Recientes + Fechas Importantes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recent Reports */}
        <div style={{ ...S.card, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Informes Recientes</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Últimos informes entregados y su estado</div>
            </div>
            <button style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              📄 Nuevo Informe
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #F0F2F5' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff', border: '1px solid #E8ECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{r.date}</div>
                </div>
                <span style={S.badge(r.color)}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fechas Importantes */}
        <div style={{ ...S.card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Fechas Importantes</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Establecidas por coordinación</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
              {dates.length}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dates.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: d.urgent ? '#FFF7ED' : '#F9FAFB', border: `1px solid ${d.urgent ? '#FED7AA' : '#F0F2F5'}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: d.urgent ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#fff', border: d.urgent ? 'none' : '1px solid #E8ECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{d.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{d.date}</div>
                </div>
                {d.urgent && <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#ef4444', color: '#fff', flexShrink: 0 }}>¡Urgente!</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Cumplimiento Mensual — full width */}
      <div style={{ ...S.card, padding: '24px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Cumplimiento Mensual</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {monthly.map((m, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg, ${m.from}, ${m.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{m.pct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 8, background: '#F0F2F5', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.pct}%`, borderRadius: 8, background: `linear-gradient(90deg, ${m.from}, ${m.to})`, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}