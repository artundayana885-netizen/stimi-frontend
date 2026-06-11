import { useState } from 'react';

const initialNotifications = [
  { id: 1, type: 'alert',   title: 'Informe pendiente',             message: 'El informe de Noviembre 2024 debe ser entregado antes del 28 de este mes',          date: '2024-11-05', read: false, icon: '🚨', color: '#ef4444', bg: '#FEF2F2', border: '#FECACA' },
  { id: 2, type: 'success', title: 'Informe aprobado',              message: 'Tu informe GC de Octubre 2024 ha sido aprobado por el coordinador',                  date: '2024-11-04', read: false, icon: '✅', color: '#16a34a', bg: '#F0FDF4', border: '#BBF7D0' },
  { id: 3, type: 'info',    title: 'Disponibilidad de plataforma',  message: 'La plataforma estará habilitada del 1 al 28 de Noviembre para subir informes',        date: '2024-11-01', read: true,  icon: '📅', color: '#0ea5e9', bg: '#F0F9FF', border: '#BAE6FD' },
  { id: 4, type: 'success', title: '¡Felicitaciones!',              message: 'Has mantenido un excelente nivel de cumplimiento del 92% durante este trimestre',     date: '2024-10-31', read: true,  icon: '🏆', color: '#16a34a', bg: '#F0FDF4', border: '#BBF7D0' },
  { id: 5, type: 'info',    title: 'Recordatorio de reunión',       message: 'Reunión de coordinación programada para el 10 de Noviembre a las 10:00 AM',          date: '2024-10-28', read: true,  icon: 'ℹ️', color: '#6366f1', bg: '#EEF2FF', border: '#C7D2FE' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const markRead = id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const remove = id => setNotifications(prev => prev.filter(n => n.id !== id));
  const unread = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n =>
    filter === 'unread' ? !n.read : filter === 'alerts' ? n.type === 'alert' : true
  );

  const tabs = [
    { key: 'all',    label: 'Todas' },
    { key: 'unread', label: 'No leídas', count: unread },
    { key: 'alerts', label: 'Alertas' },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Centro de Notificaciones</span>
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Notificaciones</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Mantente al día con las últimas actualizaciones y alertas</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === t.key ? '#111827' : '#fff',
            color: filter === t.key ? '#fff' : '#6B7280',
            border: filter === t.key ? '1px solid #111827' : '1px solid #E8ECF0',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
          }}>
            {t.label}
            {t.count > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid #F0F2F5' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>No hay notificaciones</div>
          </div>
        ) : filtered.map(n => (
          <div key={n.id} style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            border: `1.5px solid ${n.read ? '#F0F2F5' : n.border}`,
            boxShadow: n.read ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex', gap: 14, opacity: n.read ? 0.75 : 1,
            transition: 'all .2s',
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: n.bg, border: `1px solid ${n.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 14, color: n.color }}>{n.title}</strong>
                {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.color, display: 'inline-block' }} />}
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{n.message}</p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {!n.read && <button onClick={() => markRead(n.id)} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Marcar como leída</button>}
                <button onClick={() => remove(n.id)} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>🗑 Eliminar</button>
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>{n.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}