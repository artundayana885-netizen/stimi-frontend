import { useState } from 'react';

export default function SettingsView({ userName }) {
  const [notifEmail, setNotifEmail]       = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifUpdates, setNotifUpdates]   = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#16a34a') => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? '#16a34a' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: value ? 20 : 2, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E8ECF0', fontSize: 13, color: '#374151', background: '#F7F9FC', outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' };
  const card = { background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #F0F2F5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <p style={{ margin: '0 0 6px', fontSize: 13, opacity: 0.7, fontWeight: 500 }}>⚙️ Sistema</p>
        <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Configuración</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>Administra tus preferencias y configuración de cuenta</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Personal Info */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Información Personal</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Nombre completo</label><input style={inputStyle} defaultValue={userName} /></div>
              <div><label style={labelStyle}>Correo electrónico</label><input style={inputStyle} type="email" defaultValue="instructor@sena.edu.co" /></div>
              <div><label style={labelStyle}>Teléfono</label><input style={inputStyle} type="tel" defaultValue="+57 300 123 4567" /></div>
            </div>
          </div>

          {/* Notifications */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔔</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Notificaciones</div>
            </div>
            {[
              { label: 'Notificaciones por email',   sub: 'Recibe alertas por correo electrónico', val: notifEmail,    set: setNotifEmail },
              { label: 'Recordatorios de informes',  sub: 'Alertas antes de la fecha límite',      val: notifReminder, set: setNotifReminder },
              { label: 'Actualizaciones del sistema',sub: 'Novedades y mejoras',                   val: notifUpdates,  set: setNotifUpdates },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid #F7F9FC' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.sub}</div>
                </div>
                <Toggle value={item.val} onChange={item.set} />
              </div>
            ))}
          </div>

          {/* Security */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔒</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Seguridad</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Contraseña actual</label><input type="password" style={inputStyle} /></div>
              <div><label style={labelStyle}>Nueva contraseña</label><input type="password" style={inputStyle} /></div>
              <div><label style={labelStyle}>Confirmar nueva contraseña</label><input type="password" style={inputStyle} /></div>
              <button onClick={() => showToast('🔒 Contraseña actualizada')} style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 10, border: '1.5px solid #ef4444', background: '#FEF2F2', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Help */}
          <div style={{ background: '#F0FDF4', borderRadius: 16, padding: '20px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 16 }}>❓ Información de Ayuda</div>
            {[
              { label: 'Soporte técnico', value: 'soporte@sena.edu.co' },
              { label: 'Coordinador',     value: 'coordinador@sena.edu.co' },
              { label: 'Teléfono',        value: '(601) 5461500' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: '1px solid #D1FAE5' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#111827' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Language */}
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🌐 Idioma y región</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Idioma</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}><option>Español</option><option>English</option></select>
            </div>
            <div>
              <label style={labelStyle}>Zona horaria</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}><option>Colombia (GMT-5)</option></select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => showToast('✅ Configuración guardada correctamente')} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
          ⚡ Guardar Cambios
        </button>
      </div>
    </div>
  );
}