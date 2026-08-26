import { useState, useEffect } from 'react';
import UnitView from './UnitView';
import NewReport from './NewReport';
import Notifications from './Notifications';
import Compliance from './Compliance';
import AIAssistant from './AIAssistant';
import SettingsView from './SettingsView';
import { useTheme } from '../../../ThemeContext'; // ajusta si tu estructura de carpetas es distinta

const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 236;
const MOBILE_DRAWER_WIDTH = 250;
const MOBILE_BREAKPOINT = 768;

// ── Íconos de línea fina, monocromo, trazo consistente ──────────────────
const NavIcon = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5 12 4l8 6.5" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-6h4v6" />
    </svg>
  ),
  FileText: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" />
    </svg>
  ),
  Bell: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  BarChart: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10" /><path d="M12 20V4" /><path d="M20 20v-7" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="M12 8.5 13.2 11.3 16 12.5 13.2 13.7 12 16.5 10.8 13.7 8 12.5 10.8 11.3 12 8.5Z" />
    </svg>
  ),
  Settings: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
  ChevronLeft: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 14} height={p?.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18 9 12l6-6" />
    </svg>
  ),
  ChevronRight: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 14} height={p?.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6 15 12l-6 6" />
    </svg>
  ),
  LogOut: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 17} height={p?.size || 17} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  ),
  Menu: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
    </svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="M6 6l12 12" />
    </svg>
  ),
};

function SidebarInstructor({ activeView, onViewChange, onLogout, userName, collapsed, onToggleCollapse, mobile, onClose }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false); // hover para expandir temporalmente
  const initials = userName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'IN';

  // En móvil el menú siempre va expandido — colapsar no tiene sentido en un drawer angosto.
  // En escritorio: si está colapsado pero el mouse está encima, se muestra expandido.
  const isCollapsed = mobile ? false : (collapsed && !hovered);

  const principalItems = [
    { key: 'unit',          label: 'Mi Unidad',      Icon: NavIcon.Home },
    { key: 'new-report',    label: 'Nuevo Informe',  Icon: NavIcon.FileText },
    { key: 'notifications', label: 'Notificaciones', Icon: NavIcon.Bell },
    { key: 'compliance',    label: 'Cumplimiento',   Icon: NavIcon.BarChart },
  ];
  const toolItems = [
    { key: 'ai-assistant',  label: 'Asistente IA',   Icon: NavIcon.Sparkle, dot: true },
    { key: 'settings',      label: 'Configuración',  Icon: NavIcon.Settings },
  ];

  const isDark = colors.text === '#F3F4F6';
  const activeBg = isDark ? 'rgba(22,163,74,0.12)' : '#F3FAF0';
  const activeAccent = '#16a34a';

  const renderItem = (item) => {
    const isActive = activeView === item.key;
    return (
      <button
        key={item.key}
        onClick={() => { onViewChange(item.key); if (mobile) onClose?.(); }}
        title={isCollapsed ? item.label : undefined}
        style={{
          width: '100%', padding: isCollapsed ? '11px 0' : '10px 14px', border: 'none', borderRadius: 8,
          background: isActive ? activeBg : 'transparent',
          borderLeft: isActive ? `2px solid ${activeAccent}` : '2px solid transparent',
          color: isActive ? activeAccent : colors.textSecondary,
          cursor: 'pointer', textAlign: 'left', fontSize: 13.5,
          fontWeight: isActive ? 600 : 400,
          letterSpacing: '0.005em',
          display: 'flex', alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: isCollapsed ? 0 : 12,
          marginBottom: 1, transition: 'background .15s, color .15s, border-color .15s', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = colors.bg; e.currentTarget.style.color = colors.text; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textSecondary; } }}
      >
        <span style={{ display: 'flex', flexShrink: 0, opacity: isActive ? 1 : 0.75 }}><item.Icon size={18} /></span>
        {!isCollapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>}
        {!isCollapsed && item.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.textFaint, flexShrink: 0 }} />}
      </button>
    );
  };

  return (
    <aside
      onMouseEnter={() => !mobile && setHovered(true)}
      onMouseLeave={() => !mobile && setHovered(false)}
      style={{
        width: mobile ? MOBILE_DRAWER_WIDTH : (isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH),
        minWidth: mobile ? MOBILE_DRAWER_WIDTH : (isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH),
        borderRight: `1px solid ${colors.border}`, background: colors.card,
        display: 'flex', flexDirection: 'column', height: '100vh',
        position: mobile ? 'relative' : 'sticky', top: 0,
        transition: 'width .2s ease, min-width .2s ease, background .2s, border-color .2s',
        overflow: 'hidden',
      }}
    >
      {/* Logo + botón colapsar / cerrar */}
      <div style={{ padding: isCollapsed ? '24px 0 20px' : '26px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.02em', flexShrink: 0 }}>SENA</div>
            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.text, lineHeight: 1.25, whiteSpace: 'nowrap' }}>Portal Instructor</div>
                <div style={{ fontSize: 11, fontWeight: 400, color: colors.textFaint, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>Sistema de Gestión</div>
              </div>
            )}
          </div>
          {mobile ? (
            <button
              onClick={onClose}
              title="Cerrar menú"
              style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: colors.bg, color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <NavIcon.Close />
            </button>
          ) : !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              title="Colapsar menú"
              style={{
                width: 24, height: 24, borderRadius: '50%', border: 'none',
                background: 'transparent', color: colors.textFaint, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = colors.bg; e.currentTarget.style.color = colors.textSecondary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textFaint; }}
            >
              <NavIcon.ChevronLeft />
            </button>
          )}
        </div>
        {!mobile && isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Expandir menú"
            style={{
              width: 24, height: 24, borderRadius: '50%', border: 'none',
              background: 'transparent', color: colors.textFaint, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '14px auto 0', transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.bg; e.currentTarget.style.color = colors.textSecondary; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textFaint; }}
          >
            <NavIcon.ChevronRight />
          </button>
        )}
      </div>

      <div style={{ height: 1, background: colors.border, margin: isCollapsed ? '0 14px' : '0 20px' }} />

      {/* User */}
      <div style={{
        padding: isCollapsed ? '18px 0' : '18px 20px',
        display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: 11,
      }}>
        <div title={isCollapsed ? userName : undefined} style={{ width: 32, height: 32, borderRadius: '50%', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, color: colors.textMuted, border: `1px solid ${colors.border}`, flexShrink: 0 }}>
          {initials}
        </div>
        {!isCollapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: colors.textFaint }}>Instructor</div>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: colors.border, margin: isCollapsed ? '0 14px' : '0 20px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isCollapsed ? '18px 10px' : '18px 12px' }}>
        {!isCollapsed && (
          <div style={{ fontSize: 10, fontWeight: 500, color: colors.textFaint, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0 14px 10px', whiteSpace: 'nowrap' }}>Principal</div>
        )}
        {principalItems.map(renderItem)}
        {!isCollapsed && (
          <div style={{ fontSize: 10, fontWeight: 500, color: colors.textFaint, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '22px 14px 10px', whiteSpace: 'nowrap' }}>Herramientas</div>
        )}
        {toolItems.map(renderItem)}
      </nav>

      <div style={{ height: 1, background: colors.border, margin: isCollapsed ? '0 14px' : '0 20px' }} />

      {/* Logout */}
      <div style={{ padding: isCollapsed ? '16px 10px' : '16px 12px' }}>
        <button
          onClick={onLogout}
          title={isCollapsed ? 'Cerrar Sesión' : undefined}
          style={{
            width: '100%', padding: isCollapsed ? '10px 0' : '10px 14px', border: 'none', borderRadius: 8,
            background: 'transparent', color: colors.textFaint, cursor: 'pointer',
            textAlign: 'left', fontSize: 13, fontWeight: 400,
            display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? 0 : 12, transition: 'background .15s, color .15s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textFaint; }}
        >
          <NavIcon.LogOut />
          {!isCollapsed && 'Cerrar Sesión'}
        </button>
      </div>
    </aside>
  );
}

// ── Barra superior — solo visible en móvil, reemplaza al sidebar fijo ───
function MobileTopBar({ onMenuClick, colors }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', background: colors.card, borderBottom: `1px solid ${colors.border}`,
    }}>
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
      >
        <NavIcon.Menu />
      </button>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 8.5, flexShrink: 0 }}>SENA</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Portal Instructor</div>
    </div>
  );
}

export default function InstructorDashboard({ user, onLogout }) {
  const { colors } = useTheme();
  const [activeView, setActiveView] = useState('unit');
  const [collapsed, setCollapsed] = useState(true); // arranca colapsado; el hover lo expande
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < MOBILE_BREAKPOINT;

  // Si la pantalla crece de vuelta a escritorio, cierra el drawer para que no quede
  // colgando "abierto" cuando isMobile vuelva a ser true más tarde.
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  const renderView = () => {
    switch (activeView) {
      case 'unit':          return <UnitView userName={user?.name} />;
      case 'new-report':    return <NewReport />;
      case 'notifications': return <Notifications />;
      case 'compliance':    return <Compliance />;
      case 'ai-assistant':  return <AIAssistant role="instructor" userId={user?.id || user?.email} />;
      case 'settings':      return <SettingsView userName={user?.name} />;
      default:              return <UnitView userName={user?.name} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: colors.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text, transition: 'background .2s' }}>
      <style>{`
        * { scrollbar-width: thin; scrollbar-color: ${colors.borderStrong} transparent; }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${colors.borderStrong}; border-radius: 10px; }
        *::-webkit-scrollbar-thumb:hover { background: ${colors.textFaint}; }
        *::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
        *::-webkit-scrollbar-corner { background: transparent; }
      `}</style>

      {/* Escritorio / tablet ancha: sidebar fija en el flujo normal */}
      {!isMobile && (
        <SidebarInstructor
          activeView={activeView}
          onViewChange={setActiveView}
          onLogout={onLogout}
          userName={user?.name || 'Instructor'}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(v => !v)}
        />
      )}

      {/* Móvil: drawer deslizante + fondo oscuro, fuera del flujo */}
      {isMobile && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(10,20,10,0.45)',
              opacity: mobileMenuOpen ? 1 : 0, pointerEvents: mobileMenuOpen ? 'auto' : 'none',
              transition: 'opacity .2s ease',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform .25s ease', boxShadow: mobileMenuOpen ? '8px 0 24px rgba(0,0,0,0.18)' : 'none',
          }}>
            <SidebarInstructor
              activeView={activeView}
              onViewChange={setActiveView}
              onLogout={onLogout}
              userName={user?.name || 'Instructor'}
              collapsed={false}
              onToggleCollapse={() => {}}
              mobile
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {isMobile && <MobileTopBar onMenuClick={() => setMobileMenuOpen(true)} colors={colors} />}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto' }}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}