import { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';

const sena     = '#39A900';
const senaDeep = '#1F6B0A';

// ── Íconos de línea, consistentes con el resto de la app ─────────────────
const IconBell = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);
const IconAlert = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><path d="M12 17h.01" />
  </svg>
);
const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" />
  </svg>
);
const IconTrophy = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5H5a2 2 0 0 0 0 4h1.5" /><path d="M16 5h3a2 2 0 0 1 0 4h-1.5" />
    <path d="M12 14v4" /><path d="M9 21h6" /><path d="M9 21c0-1.7 1.3-3 3-3s3 1.3 3 3" />
  </svg>
);
const IconInfo = (p) => (
  <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-5" /><path d="M12 8h.01" />
  </svg>
);

export default function Notifications() {
  const { colors, theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  // ── Notificaciones de ejemplo eliminadas. Ahora solo se cargan las
  // que existan en localStorage bajo la clave 'sena_notifications'.
  // Cada notificación debe tener: { id, type, title, message, date, read }
  // donde type es uno de: 'alert' | 'success' | 'info'.
  useEffect(() => {
    const savedNotifs = JSON.parse(localStorage.getItem('sena_notifications') || '[]');
    const mapped = savedNotifs.map(n => {
      let Icon = IconInfo;
      if (n.type === 'alert') Icon = IconAlert;
      if (n.type === 'success') Icon = IconCheck;
      if (n.type === 'info') Icon = IconCalendar;
      if (n.type === 'trophy') Icon = IconTrophy;
      return {
        ...n,
        Icon,
        bgLight: n.type === 'alert' ? '#FEF2F2' : (n.type === 'success' ? '#F0FDF4' : '#F0F9FF'),
        bgDark: n.type === 'alert' ? 'rgba(239,68,68,0.12)' : (n.type === 'success' ? 'rgba(57,169,0,0.14)' : 'rgba(14,165,233,0.12)'),
        borderLight: n.type === 'alert' ? '#FECACA' : (n.type === 'success' ? '#BBF7D0' : '#BAE6FD'),
        borderDark: n.type === 'alert' ? '#5C1E1E' : (n.type === 'success' ? '#1F4A2E' : '#0C4A6E'),
      };
    });
    setNotifications(mapped);
  }, []);

  const markRead = id => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('sena_notifications', JSON.stringify(updated.map(({ Icon, ...rest }) => rest)));
      return updated;
    });
  };

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
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text }}>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${sena} 0%, ${senaDeep} 100%)`,
        borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 10px 28px rgba(31,107,10,0.25)',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <IconBell size={16} />
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Centro de Notificaciones</span>
        </div>
        <h2 style={{ position: 'relative', margin: '0 0 4px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Notificaciones</h2>
        <p style={{ position: 'relative', margin: 0, fontSize: 13, opacity: 0.88 }}>Mantente al día con las últimas actualizaciones y alertas</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === t.key ? senaDeep : colors.card,
            color: filter === t.key ? '#fff' : colors.textMuted,
            border: filter === t.key ? `1px solid ${senaDeep}` : `1px solid ${colors.borderStrong}`,
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
          <div style={{ padding: '48px 24px', textAlign: 'center', background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: colors.textFaint }}><IconBell size={38} /></div>
            <div style={{ fontSize: 14, color: colors.textFaint }}>No hay notificaciones</div>
          </div>
        ) : filtered.map(n => {
          const border = theme === 'dark' ? n.borderDark : n.borderLight;
          const bg = theme === 'dark' ? n.bgDark : n.bgLight;
          return (
            <div key={n.id} style={{
              background: colors.card, borderRadius: 14, padding: '18px 20px',
              border: `1.5px solid ${n.read ? colors.border : border}`,
              boxShadow: n.read ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', gap: 14, opacity: n.read ? 0.75 : 1,
              transition: 'all .2s',
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.color, flexShrink: 0 }}><n.Icon /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <strong style={{ fontSize: 14, color: n.color }}>{n.title}</strong>
                  {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.color, display: 'inline-block' }} />}
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>{n.message}</p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {!n.read && <button onClick={() => markRead(n.id)} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Marcar como leída</button>}
                  <span style={{ fontSize: 11, color: colors.textFaint, marginLeft: 'auto' }}>{n.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}