export default function Sidebar({ activeView, onViewChange, onLogout, role, trashCount = 2, notifCount = 3 }) {

  const principalItems = role === 'coordinator' ? [
    { key: 'unit',              label: 'Panel Principal',        icon: '🏠' },
    { key: 'report-management', label: 'Revisar Documentos',     icon: '📋', badge: notifCount },
    { key: 'notifications',     label: 'Enviar Notificaciones',  icon: '📣' },
    { key: 'templates',         label: 'Requisitos',             icon: '📂' },
    { key: 'user-management',   label: 'Administrar Roles',      icon: '👤' },
  ] : [];

  const toolItems = role === 'coordinator' ? [
    { key: 'ai-assistant',  label: 'Asistente IA', icon: '✨', dot: true },
    { key: 'trash',         label: 'Papelera',     icon: '🗑', badge: trashCount },
  ] : [];

  const renderItem = (item) => {
    const isActive = activeView === item.key;
    return (
      <button
        key={item.key}
        onClick={() => onViewChange(item.key)}
        style={{
          position: 'relative',
          width: '100%', padding: '10px 14px 10px 18px', border: 'none', borderRadius: 9,
          background: isActive ? 'rgba(201,162,39,0.12)' : 'transparent',
          color: isActive ? '#F3EFE4' : '#9FB3A4',
          cursor: 'pointer', textAlign: 'left', fontSize: 13.5,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          fontWeight: isActive ? 600 : 500,
          display: 'flex', alignItems: 'center', gap: 11,
          marginBottom: 3, transition: 'background .18s, color .18s',
          overflow: 'visible',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#F3EFE4'; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9FB3A4'; } }}
      >
        {/* Cinta dorada — marcador de sección activa, como una cinta de certificación */}
        <span style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: isActive ? 20 : 0, borderRadius: '0 3px 3px 0',
          background: '#C9A227', transition: 'height .2s ease',
        }} />

        <span style={{ fontSize: 15.5, width: 20, textAlign: 'center', opacity: isActive ? 1 : 0.85 }}>{item.icon}</span>
        <span style={{ flex: 1, letterSpacing: '0.01em' }}>{item.label}</span>

        {/* Badge numérico dorado */}
        {item.badge > 0 && (
          <span style={{
            minWidth: 19, height: 19, borderRadius: 10, padding: '0 6px',
            background: isActive ? '#C9A227' : 'rgba(201,162,39,0.85)',
            color: '#0F2E1F',
            fontSize: 10.5, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{item.badge}</span>
        )}

        {/* Dot de IA */}
        {item.dot && (
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#C084FC', flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(192,132,252,0.18)',
          }} />
        )}
      </button>
    );
  };

  return (
    <aside style={{
      width: 236, minWidth: 236, borderRight: '1px solid rgba(255,255,255,0.06)',
      background: 'linear-gradient(180deg, #0F2E1F 0%, #0C2419 100%)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Logo */}
      <div style={{ padding: '22px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: 'linear-gradient(135deg, #C9A227, #A9841D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0F2E1F', fontWeight: 800, fontSize: 11, letterSpacing: 0.5,
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 4px 12px rgba(201,162,39,0.25)',
          }}>
            SENA
          </div>
          <div>
            <div style={{
              fontSize: 15, fontWeight: 600, color: '#F3EFE4', lineHeight: 1.2,
              fontFamily: "'Fraunces', serif", letterSpacing: '0.01em',
            }}>
              Portal Coordinador
            </div>
            <div style={{ fontSize: 10.5, color: '#7E9483', marginTop: 1, letterSpacing: '0.03em' }}>
              Sistema de Gestión
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18, height: 1, background: 'linear-gradient(90deg, rgba(201,162,39,0.35), transparent)' }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 14px' }}>

        {/* SECCIÓN PRINCIPAL */}
        {principalItems.length > 0 && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 600, color: '#5C7364', letterSpacing: '0.14em',
              textTransform: 'uppercase', padding: '10px 14px 10px', marginBottom: 2,
              fontFamily: "'Fraunces', serif",
            }}>
              Principal
            </div>
            {principalItems.map(renderItem)}
          </>
        )}

        {/* SECCIÓN HERRAMIENTAS */}
        {toolItems.length > 0 && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 600, color: '#5C7364', letterSpacing: '0.14em',
              textTransform: 'uppercase', padding: '20px 14px 10px', marginBottom: 2,
              fontFamily: "'Fraunces', serif",
            }}>
              Herramientas
            </div>
            {toolItems.map(renderItem)}
          </>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '14px 14px 18px' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '10px 14px', border: 'none', borderRadius: 9,
            background: 'transparent', color: '#E2897E', cursor: 'pointer',
            textAlign: 'left', fontSize: 13.5, fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', gap: 11, transition: 'background .18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,137,126,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 14 }}>→</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}