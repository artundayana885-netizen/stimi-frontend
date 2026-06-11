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
      <button key={item.key} onClick={() => onViewChange(item.key)} style={{
        width: '100%', padding: '9px 12px', border: 'none', borderRadius: 10,
        background: isActive ? '#F0FDF4' : 'transparent',
        color: isActive ? '#16a34a' : '#374151',
        cursor: 'pointer', textAlign: 'left', fontSize: 13.5,
        fontWeight: isActive ? 700 : 500,
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 2, transition: 'all .15s',
      }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F7F9FC'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>

        {/* Badge numérico */}
        {item.badge > 0 && (
          <span style={{
            minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
            background: '#16a34a', color: '#fff',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{item.badge}</span>
        )}

        {/* Dot de IA */}
        {item.dot && (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', flexShrink: 0 }} />
        )}

        {/* Indicador activo */}
        {isActive && !item.badge && !item.dot && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
        )}
      </button>
    );
  };

  return (
    <aside style={{
      width: 220, minWidth: 220, borderRight: '1px solid #E8ECF0',
      background: '#fff', display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #F0F2F5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>
            SENA
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Portal Coordinador</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Sistema de Gestión</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>

        {/* SECCIÓN PRINCIPAL */}
        {principalItems.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px 8px', marginBottom: 2 }}>
              PRINCIPAL
            </div>
            {principalItems.map(renderItem)}
          </>
        )}

        {/* SECCIÓN HERRAMIENTAS */}
        {toolItems.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 12px 8px', marginBottom: 2 }}>
              HERRAMIENTAS
            </div>
            {toolItems.map(renderItem)}
          </>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #F0F2F5' }}>
        <button onClick={onLogout} style={{
          width: '100%', padding: '9px 12px', border: 'none', borderRadius: 10,
          background: 'transparent', color: '#ef4444', cursor: 'pointer',
          textAlign: 'left', fontSize: 13.5, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 14 }}>→</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}