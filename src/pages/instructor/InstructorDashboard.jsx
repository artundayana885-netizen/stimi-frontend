import { useState } from 'react';
import UnitView from '../../components/instructor/UnitView';
import NewReport from '../../components/instructor/NewReport';
import Notifications from '../../components/instructor/Notifications';
import Compliance from '../../components/instructor/Compliance';
import AIAssistant from '../../components/instructor/AIAssistant';
import SettingsView from '../../components/instructor/SettingsView';

function SidebarInstructor({ activeView, onViewChange, onLogout, userName }) {
  const initials = userName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'IN';

  const principalItems = [
    { key: 'unit',          label: 'Mi Unidad',       icon: '🏠' },
    { key: 'new-report',    label: 'Nuevo Informe',    icon: '📄' },
    { key: 'notifications', label: 'Notificaciones',   icon: '🔔' },
    { key: 'compliance',    label: 'Cumplimiento',     icon: '📊' },
  ];
  const toolItems = [
    { key: 'ai-assistant',  label: 'Asistente IA',     icon: '✨', dot: true },
    { key: 'settings',      label: 'Configuración',     icon: '⚙️' },
  ];

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
        marginBottom: 2, transition: 'all .15s', fontFamily: 'inherit',
      }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F7F9FC'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: 16 }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />}
        {isActive && !item.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />}
      </button>
    );
  };

  return (
    <aside style={{ width: 220, minWidth: 220, borderRight: '1px solid #E8ECF0', background: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #F0F2F5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11 }}>SENA</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Portal Instructor</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Sistema de Gestión</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8ECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6B7280', border: '2px solid #D1D5DB', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Instructor</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px 8px' }}>PRINCIPAL</div>
        {principalItems.map(renderItem)}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 12px 8px' }}>HERRAMIENTAS</div>
        {toolItems.map(renderItem)}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #F0F2F5' }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '9px 12px', border: 'none', borderRadius: 10, background: 'transparent', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span>→</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default function InstructorDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('unit');

  const renderView = () => {
    switch (activeView) {
      case 'unit':          return <UnitView userName={user?.name} />;
      case 'new-report':    return <NewReport />;
      case 'notifications': return <Notifications />;
      case 'compliance':    return <Compliance />;
      case 'ai-assistant':  return <AIAssistant />;
      case 'settings':      return <SettingsView userName={user?.name} />;
      default:              return <UnitView userName={user?.name} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F9FC', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <SidebarInstructor activeView={activeView} onViewChange={setActiveView} onLogout={onLogout} userName={user?.name || 'Instructor'} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {renderView()}
      </main>
    </div>
  );
}