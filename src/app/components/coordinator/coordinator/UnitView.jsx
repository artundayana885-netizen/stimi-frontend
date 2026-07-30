import { useState } from 'react';
import Toast from '../Toast';

export default function UnitView({ userName, onViewChange }) {
  const [toast, setToast] = useState(null);
  const [dates, setDates] = useState([
    { id: 1, label: 'Fecha límite entregas mensuales', date: '29 de octubre', urgent: true },
  ]);
  const [showAddDate, setShowAddDate] = useState(false);
  const [newDate, setNewDate] = useState({ label: '', date: '' });

  const showToast = (msg, color = '#16a34a') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = [
    { icon: '👥', value: '45', label: 'Total Instructores',     accent: '#6366f1', bg: '#EEF2FF' },
    { icon: '✅', value: '38', label: 'Informes Aprobados',     accent: '#22c55e', bg: '#F0FDF4' },
    { icon: '⏰', value: '5',  label: 'Pendientes de Revisión', accent: '#f97316', bg: '#FFF7ED' },
    { icon: '🚨', value: '2',  label: 'Con Alertas',            accent: '#ef4444', bg: '#FEF2F2' },
  ];

  const recentActivity = [
    { name: 'Juan Delgado',  action: 'Subió documento: Plan_Formacion.pdf',    time: 'Hace 5 min',   dot: '#22c55e' },
    { name: 'Ana Martínez',  action: 'Completó requisitos: Octubre 2025',       time: 'Hace 20 min',  dot: '#22c55e' },
    { name: 'Carlos Ruiz',   action: 'Pendiente revisión: Informe_Mensual.pdf', time: 'Hace 1 hora',  dot: '#f97316' },
    { name: 'Laura Gómez',   action: 'Subió documento: Evidencias.xlsx',        time: 'Hace 2 horas', dot: '#22c55e' },
  ];

  const compliance = [
    { month: 'Noviembre 2024',  value: 89 },
    { month: 'Octubre 2024',    value: 92 },
    { month: 'Septiembre 2024', value: 86 },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>

      {/* Toast */}
      <Toast toast={toast} />

      {/* Banner */}
      <div className="coord-banner" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <p style={{ margin: '0 0 6px', fontSize: 13, opacity: 0.8, fontWeight: 500 }}>Panel de Control · Coordinador</p>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>¡Excelente Trabajo, {userName}!</h1>
        <p style={{ margin: '0 0 18px', fontSize: 14, opacity: 0.85 }}>Tu gestión mantiene un alto nivel de cumplimiento en la unidad</p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600 }}>
          🏆 89% de cumplimiento general
        </span>
      </div>

      {/* Stats */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow .15s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
            onClick={() => {
              if (s.label === 'Total Instructores') onViewChange?.('user-management');
              else if (s.label === 'Informes Aprobados') onViewChange?.('report-management');
              else if (s.label === 'Pendientes de Revisión') onViewChange?.('report-management');
              else if (s.label === 'Con Alertas') onViewChange?.('compliance');
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actividad Reciente + Fechas Importantes */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Actividad Reciente */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Actividad Reciente</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Últimas acciones de instructores</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentActivity.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid #F7F9FC' : 'none' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: act.dot, flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{act.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{act.action}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fechas Importantes */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Fechas Importantes</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Próximos vencimientos y eventos</div>
            </div>
            <button onClick={() => setShowAddDate(true)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              + Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dates.map((d) => (
              <div key={d.id} style={{ background: '#F7F9FC', borderRadius: 10, padding: '12px 14px', border: '1px solid #E8ECF0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{d.date}</div>
                  {d.urgent && <span style={{ marginTop: 6, display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700 }}>¡Urgente!</span>}
                </div>
                {/* Botones editar / eliminar */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => showToast(`✏️ Editar: ${d.label}`)}
                    title="Editar"
                    style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E8ECF0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#6B7280', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >✏️</button>
                  <button
                    onClick={() => setDates(prev => prev.filter(x => x.id !== d.id))}
                    title="Eliminar"
                    style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#ef4444', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                  >🗑</button>
                </div>
              </div>
            ))}
            {dates.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 13 }}>No hay fechas registradas</div>
            )}
          </div>
        </div>
      </div>

      {/* Cumplimiento — ancho completo */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px 28px', border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 18 }}>Cumplimiento de la Unidad</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* Círculo izquierda */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="36" fill="none" stroke="#E8ECF0" strokeWidth="8"/>
              <circle cx="45" cy="45" r="36" fill="none" stroke="#16a34a" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 36 * 0.89} ${2 * Math.PI * 36}`}
                strokeLinecap="round" transform="rotate(-90 45 45)"/>
              <text x="45" y="49" textAnchor="middle" fontSize="16" fontWeight="700" fill="#111827">89%</text>
            </svg>
            <div style={{ fontSize: 11, color: '#6B7280', textAlign: 'center' }}>Cumplimiento general</div>
          </div>
          {/* Barras derecha */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {compliance.map((c) => (
              <div key={c.month}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{c.month}</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{c.value}%</span>
                </div>
                <div style={{ height: 8, background: '#F0F2F5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.value}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => onViewChange?.('reports')} style={{ width: '100%', marginTop: 20, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          → Ver Estadísticas Completas
        </button>
      </div>

      {/* Modal Agregar Fecha */}
      {showAddDate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)' }}
          onClick={() => setShowAddDate(false)}>
          <div style={{ background: '#fff', borderRadius: 20, width: 'min(420px,100%)', padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Agregar Fecha Importante</div>
              <button onClick={() => setShowAddDate(false)} style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Descripción</label>
                <input value={newDate.label} onChange={e => setNewDate(d => ({ ...d, label: e.target.value }))}
                  placeholder="Ej: Entrega de informes mensuales"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E8ECF0', fontSize: 13, color: '#374151', background: '#F7F9FC', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Fecha</label>
                <input value={newDate.date} onChange={e => setNewDate(d => ({ ...d, date: e.target.value }))}
                  placeholder="Ej: 15 de noviembre"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E8ECF0', fontSize: 13, color: '#374151', background: '#F7F9FC', outline: 'none' }} />
              </div>
              <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowAddDate(false)} style={{ padding: '11px', borderRadius: 10, border: '1px solid #E8ECF0', background: '#F7F9FC', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => {
                  if (!newDate.label.trim()) return;
                  setDates(prev => [...prev, { id: Date.now(), label: newDate.label, date: newDate.date, urgent: false }]);
                  setNewDate({ label: '', date: '' });
                  setShowAddDate(false);
                  showToast('📅 Fecha agregada correctamente');
                }} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}