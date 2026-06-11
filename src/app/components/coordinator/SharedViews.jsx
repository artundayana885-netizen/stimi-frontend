import { useState } from 'react';

export function Notifications() {
  const [filter, setFilter] = useState('Todas');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Informes pendientes de revisión', message: 'Hay 5 informes esperando tu aprobación. Por favor revisalos antes del 10 de Noviembre', read: false, type: 'danger', date: '2024-11-05', color: '#ef4444', bg: '#FEF2F2', icon: '🚨' },
    { id: 2, title: 'Cumplimiento del 92%', message: 'La unidad ha alcanzado un cumplimiento del 92% este mes. ¡Excelente trabajo!', read: false, type: 'success', date: '2024-11-04', color: '#22c55e', bg: '#F0FDF4', icon: '✅' },
    { id: 3, title: 'Nuevo informe recibido', message: 'María González ha enviado su Informe GC de Noviembre 2024', read: false, type: 'info', date: '2024-11-03', color: '#6366f1', bg: '#EEF2FF', icon: '📋' },
    { id: 4, title: 'Nuevo instructor agregado', message: 'Pedro Sánchez ha sido agregado al sistema como instructor', read: true, type: 'neutral', date: '2024-11-02', color: '#6B7280', bg: '#F7F9FC', icon: '👤' },
    { id: 5, title: 'Recordatorio de cierre mensual', message: 'El período de carga de informes cierra el 28 de Noviembre', read: true, type: 'warning', date: '2024-11-01', color: '#f97316', bg: '#FFF7ED', icon: '⏰' },
  ]);

  const unread = notifications.filter(n => !n.read).length;
  const markOne = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteOne = (id) => setNotifications(notifications.filter(n => n.id !== id));

  const shown = notifications.filter(n =>
    filter === 'Todas' ? true : filter === 'No leídas' ? !n.read : n.type === 'danger'
  );

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>

      {/* Banner gradient rosa-morado como en el figma */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔔</div>
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Centro de Notificaciones</span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Notificaciones</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Mantente al día con las últimas actualizaciones y alertas del sistema</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['Todas', 'No leídas', 'Alertas'].map((t) => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === t ? '#111827' : '#fff',
            color: filter === t ? '#fff' : '#6B7280',
            border: filter === t ? '1px solid #111827' : '1px solid #E8ECF0',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t}
            {t === 'No leídas' && unread > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{unread}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shown.map((n) => (
          <div key={n.id} style={{
            background: '#fff', borderRadius: 14, padding: '16px 20px',
            border: `1px solid ${n.read ? '#F0F2F5' : '#E8ECF0'}`,
            boxShadow: n.read ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex', gap: 14, alignItems: 'flex-start',
            opacity: n.read ? 0.75 : 1,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {n.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 14, color: n.color }}>{n.title}</strong>
                {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.color, display: 'inline-block' }} />}
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{n.message}</p>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {!n.read && (
                  <button onClick={() => markOne(n.id)} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                    Marcar como leída
                  </button>
                )}
                <button onClick={() => deleteOne(n.id)} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                  🗑 Eliminar
                </button>
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>{n.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryView() {
  const historyItems = [
    { id: 1, instructor: 'María González', action: 'Informe aprobado', type: 'GC', month: 'Octubre', date: '2024-11-10', by: 'María Coordinadora', color: '#22c55e', bg: '#F0FDF4', icon: '✅' },
    { id: 2, instructor: 'Carlos Rodríguez', action: 'Informe rechazado', type: 'GF', month: 'Octubre', date: '2024-11-10', by: 'María Coordinadora', color: '#ef4444', bg: '#FEF2F2', icon: '❌' },
    { id: 3, instructor: 'Ana Martínez', action: 'Informe aprobado', type: 'GC', month: 'Septiembre', date: '2024-10-15', by: 'María Coordinadora', color: '#22c55e', bg: '#F0FDF4', icon: '✅' },
    { id: 4, instructor: 'Laura Torres', action: 'Usuario activado', type: '-', month: '-', date: '2024-10-01', by: 'Sistema', color: '#6366f1', bg: '#EEF2FF', icon: '👤' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ margin: '0 0 4px', fontSize: 13, opacity: 0.85, fontWeight: 500 }}>🕐 Registro</p>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Historial de Actividades</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Todas las acciones registradas en el sistema</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {historyItems.map((item, i) => (
          <div key={item.id} style={{
            display: 'flex', padding: '14px 20px', alignItems: 'center', gap: 14,
            borderBottom: i < historyItems.length - 1 ? '1px solid #F7F9FC' : 'none',
            transition: 'background .1s',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F9FC')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.instructor}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>por {item.by}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.action}</span>
            <span style={{ fontSize: 12, padding: '3px 10px', background: '#F7F9FC', borderRadius: 6, color: '#6B7280' }}>{item.type}</span>
            <span style={{ fontSize: 12, color: '#6B7280', minWidth: 70 }}>{item.month}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsView({ userName }) {
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>
      <div style={{
        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <p style={{ margin: '0 0 4px', fontSize: 13, opacity: 0.7, fontWeight: 500 }}>⚙️ Sistema</p>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Configuración</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>Personaliza tu cuenta y preferencias</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 16, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Perfil de Usuario</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#16a34a', border: '3px solid #BBF7D0' }}>
            {userName?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'MC'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{userName}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Coordinador · SENA</div>
          </div>
          <button style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: '1px solid #E8ECF0', background: '#F7F9FC', fontSize: 13, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
            Editar perfil
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Nombre completo', value: userName },
            { label: 'Rol', value: 'Coordinador' },
            { label: 'Email', value: 'coordinador@sena.edu.co' },
            { label: 'Unidad', value: 'Regional Bogotá' },
          ].map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ padding: '10px 12px', background: '#F7F9FC', borderRadius: 8, fontSize: 14, border: '1px solid #F0F2F5', color: '#111827' }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Preferencias de Notificaciones</h2>
        {[
          'Notificar informes pendientes',
          'Notificar nuevos registros',
          'Resumen semanal por email',
          'Alertas de cumplimiento bajo',
        ].map((pref) => (
          <div key={pref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F7F9FC' }}>
            <span style={{ fontSize: 14, color: '#374151' }}>{pref}</span>
            <div style={{ width: 42, height: 24, borderRadius: 12, background: '#16a34a', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, right: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
