import { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import UnitView from './UnitView';
import ReportManagement from './ReportManagement';
import Reports from './Reports';
import UserManagement from './UserManagement';
import ComplianceView from './ComplianceView';
import { Notifications, HistoryView, SettingsView } from './SharedViews';
import apiClient from '../../../services/apiClient';
import { getAllUsers } from '../../../services/authService';
import AIAssistant from '../instructor/AIAssistant';

/* ============================================================
   ICONOS — línea profesional, 2px de trazo, estáticos (sin
   emojis del sistema operativo). Paleta: verde institucional
   + naranja como acento.
   ============================================================ */
const BRAND = {
  greenDark: '#14532d',
  green: '#166534',
  greenMid: '#15803d',
  greenSoft: '#16a34a',
  orange: '#c2410c',
  orangeMid: '#ea580c',
  orangeSoft: '#f97316',
};

const Icon = ({ children, size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

const IconHome = (p) => <Icon {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>;
const IconClipboard = (p) => <Icon {...p}><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M5 4h2a2 2 0 012 2v1h6V6a2 2 0 012-2h2a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" /></Icon>;
const IconBarChart = (p) => <Icon {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></Icon>;
const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icon>;
const IconUsers = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" /></Icon>;
const IconLogOut = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Icon>;
// Ícono de "asistente" en forma de destello sólido, estático y elegante.
const IconSparkle = (p) => (
  <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.5c.6 4.3 2.9 6.6 7.2 7.2-4.3.6-6.6 2.9-7.2 7.2-.6-4.3-2.9-6.6-7.2-7.2 4.3-.6 6.6-2.9 7.2-7.2z" />
  </svg>
);

// Icono tipo "hamburguesa en círculo" para el botón de abrir/cerrar el menú
function MenuToggleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="7" y1="9" x2="17" y2="9" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" strokeLinecap="round" />
      <line x1="7" y1="15" x2="17" y2="15" strokeLinecap="round" />
    </svg>
  );
}

function SidebarComponent({ activeView, onViewChange, onLogout, role, notifCount = 3, pendingCount = 0, userName = 'Coordinador' }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [expanded, setExpanded] = useState(false);
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const principalItems = role === 'coordinator' ? [
    { key: 'unit',              label: 'Unidad', icon: <IconHome /> },
    { key: 'report-management', label: 'Gestión de informes', badge: notifCount, icon: <IconClipboard /> },
    { key: 'reports',           label: 'Reportes', icon: <IconBarChart /> },
    { key: 'compliance',        label: 'Cumplimiento', icon: <IconTarget /> },
    { key: 'user-management',   label: 'Usuarios', badge: pendingCount, icon: <IconUsers /> },
    { key: 'notifications',     label: 'Notificaciones', badge: notifCount, icon: <IconBell /> },
    { key: 'history',           label: 'Historial', icon: <IconClock /> },
  ] : [];

  const toolItems = role === 'coordinator' ? [
    { key: 'ai-assistant', label: 'Asistente IA',  icon: <IconSparkle size={17} />, dot: true },
    { key: 'settings',     label: 'Configuración',  icon: <IconSettings /> },
  ] : [];

  const renderItem = (item) => {
    const isActive = activeView === item.key;
    return (
      <button key={item.key} onClick={() => onViewChange(item.key)} title={!expanded ? item.label : undefined} style={{
        width: '100%', padding: expanded ? '9px 12px' : '9px 0', border: 'none', borderRadius: 10,
        background: isActive ? (isDark ? 'rgba(21,128,61,0.22)' : '#F0FDF4') : 'transparent',
        color: isActive ? (isDark ? '#4ADE80' : BRAND.greenMid) : colors.textSecondary,
        cursor: 'pointer', textAlign: 'left', fontSize: 13.5,
        fontWeight: isActive ? 700 : 500,
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: expanded ? 'flex-start' : 'center',
        marginBottom: 2, transition: 'background .15s',
      }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = colors.border; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ position: 'relative', display: 'flex', width: 20, justifyContent: 'center', flexShrink: 0, color: isActive ? (isDark ? '#4ADE80' : BRAND.greenMid) : colors.textMuted }}>
          {item.icon || ''}
          {!expanded && item.badge > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -8,
              minWidth: 15, height: 15, borderRadius: 8, padding: '0 3px',
              background: BRAND.orangeMid, color: '#fff', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${colors.card}`,
            }}>{item.badge > 9 ? '9+' : item.badge}</span>
          )}
          {!expanded && item.dot && (
            <span style={{
              position: 'absolute', top: -2, right: -4,
              width: 7, height: 7, borderRadius: '50%', background: BRAND.orangeMid,
              border: `1.5px solid ${colors.card}`,
            }} />
          )}
        </span>
        {expanded && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
        {expanded && item.badge > 0 && (
          <span style={{ minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px', background: BRAND.orangeMid, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>
        )}
        {expanded && item.dot && (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.orangeMid, flexShrink: 0 }} />
        )}
        {expanded && isActive && !item.badge && !item.dot && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: BRAND.greenMid, flexShrink: 0 }} />
        )}
      </button>
    );
  };

  return (
    <aside
  onMouseEnter={() => setExpanded(true)}
  onMouseLeave={() => setExpanded(false)}
  style={{
    width: expanded ? 220 : 72, minWidth: expanded ? 220 : 72,
    borderRight: `1px solid ${colors.border}`, background: colors.card,
    display: 'flex', flexDirection: 'column', height: '100vh',
    position: 'sticky', top: 0, transition: 'width .16s ease, min-width .18s ease',
    overflow: 'hidden',
 

    }}>
      <style>{`
        .sidebar-scroll {
          scrollbar-width: none;      /* Firefox */
          -ms-overflow-style: none;   /* Edge/IE viejo */
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;              /* Chrome, Edge, Safari */
        }
      `}</style>
      {/* Logo SENA + botón para abrir/cerrar */}
      <div style={{ padding: expanded ? '18px 16px 14px' : '18px 0 14px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: expanded ? 'space-between' : 'center', padding: expanded ? 0 : '0 12px' }}>
          {expanded ? (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND.greenMid}, ${BRAND.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: 0.5, flexShrink: 0 }}>SENA</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Portal Coordinador</div>
        <div style={{ fontSize: 11, color: colors.textMuted, whiteSpace: 'nowrap' }}>Sistema de Gestión</div>
      </div>
    </div>
    <span style={{ color: colors.textMuted, padding: 4, flexShrink: 0, display: 'flex' }}>
      <MenuToggleIcon />
    </span>
  </>
) : (
  <span style={{ color: BRAND.greenMid, padding: 4, display: 'flex' }}>
    <MenuToggleIcon size={26} />
  </span>

          )}
        </div>
      </div>

      {/* Usuario logueado */}
      <div style={{ padding: expanded ? '12px 16px' : '12px 0', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 10, justifyContent: expanded ? 'flex-start' : 'center' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: isDark ? 'rgba(21,128,61,0.18)' : '#F0FDF4', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, fontWeight: 700,
          color: BRAND.greenMid, flexShrink: 0, border: `2px solid ${isDark ? BRAND.greenMid : '#BBF7D0'}`,
        }}>
          {initials}
        </div>
        {expanded && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>Coordinador</div>
          </div>
        )}
      </div>
      <nav className="sidebar-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: expanded ? '12px 10px' : '12px 8px' }}>
        {principalItems.length > 0 && (
          <>
            {expanded && <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px 8px', marginBottom: 2, whiteSpace: 'nowrap' }}>PRINCIPAL</div>}
            {principalItems.map(renderItem)}
          </>
        )}
        {toolItems.length > 0 && (
          <>
            {expanded && <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 12px 8px', marginBottom: 2, whiteSpace: 'nowrap' }}>HERRAMIENTAS</div>}
            {toolItems.map(renderItem)}
          </>
        )}
      </nav>
      <div style={{ padding: expanded ? '12px 10px' : '12px 8px', borderTop: `1px solid ${colors.border}` }}>
        <button onClick={onLogout} title={!expanded ? 'Cerrar Sesión' : undefined} style={{ width: '100%', padding: expanded ? '9px 12px' : '9px 0', border: 'none', borderRadius: 10, background: 'transparent', color: '#dc2626', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, justifyContent: expanded ? 'flex-start' : 'center', transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ display: 'flex', flexShrink: 0 }}><IconLogOut size={16} /></span> {expanded && 'Cerrar Sesión'}
        </button>
      </div>
    </aside>
  );
}

export default function CoordinatorDashboard({ user, onLogout, pendingUsers, setPendingUsers, onAssignRole, onRejectUser, notifications, setNotifications }) {
  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === 'dark';
  const [activeView, setActiveView] = useState('unit');
  const [dbUsers, setDbUsers] = useState([]);

  const fetchDbUsers = async () => {
    try {
      const data = await getAllUsers();
      setDbUsers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDbUsers();
    const timer = setInterval(fetchDbUsers, 8000);
    return () => clearInterval(timer);
  }, []);

  const pendingCount = dbUsers.filter(u => u.estado === 'Pendiente').length;
  const unreadNotifCount = (notifications || []).filter(n => !n.read).length;

  const renderView = () => {
    switch (activeView) {
      case 'unit': return <UnitView userName={user?.name || 'María Coordinadora'} onViewChange={setActiveView} />;
      case 'report-management': return <ReportManagement />;
      case 'reports': return <Reports />;
      case 'compliance': return <ComplianceView />;
      case 'user-management': return (
        <UserManagement
          pendingUsers={pendingUsers}
          setPendingUsers={setPendingUsers}
          onAssignRole={onAssignRole}
          onRejectUser={onRejectUser}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      );
      case 'notifications': return <Notifications notifications={notifications} setNotifications={setNotifications} />;
      case 'history': return <HistoryView />;
      case 'settings': return (
        <SettingsView
          userName={user?.name || 'María Coordinadora'}
          darkMode={isDark}
          onToggleDarkMode={toggleTheme}
        />
      );
      case 'ai-assistant': return <AIAssistant role="coordinador" userId={user?.id || user?.email} />;
      default: return <UnitView userName={user?.name || 'María Coordinadora'} onViewChange={setActiveView} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <SidebarComponent
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
        role="coordinator"
        userName={user?.name || 'María Coordinadora'}
        notifCount={unreadNotifCount}
        pendingCount={pendingCount}
      />
      <style>{`
        .main-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .main-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
      <main className="main-scroll" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: colors.bg }}>
        {renderView()}
      </main>
    </div>
  );
}