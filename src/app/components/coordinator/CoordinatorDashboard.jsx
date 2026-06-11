import { useState } from 'react';
import UnitView from './UnitView';
import ReportManagement from './ReportManagement';
import Reports from './Reports';
import UserManagement from './UserManagement';
import ComplianceView from './ComplianceView';
import TrashView from './TrashView';
import { Notifications, HistoryView, SettingsView } from './SharedViews';

function SidebarComponent({ activeView, onViewChange, onLogout, role, trashCount = 2, notifCount = 3, userName = 'Coordinador' }) {
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const principalItems = role === 'coordinator' ? [
    { key: 'unit',              label: 'Unidad' },
    { key: 'report-management', label: 'Gestión de informes', badge: notifCount },
    { key: 'reports',           label: 'Reportes' },
    { key: 'compliance',        label: 'Cumplimiento' },
    { key: 'user-management',   label: 'Usuarios' },
    { key: 'notifications',     label: 'Notificaciones' },
    { key: 'history',           label: 'Historial' },
  ] : [];

  const toolItems = role === 'coordinator' ? [
    { key: 'ai-assistant', label: 'Asistente IA',  icon: '✨', dot: true },
    { key: 'trash',        label: 'Papelera',       icon: '🗑',  badge: trashCount },
    { key: 'settings',     label: 'Configuración',  icon: '⚙️' },
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
        <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon || ''}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge > 0 && (
          <span style={{ minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px', background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>
        )}
        {item.dot && (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', flexShrink: 0 }} />
        )}
        {isActive && !item.badge && !item.dot && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
        )}
      </button>
    );
  };

  return (
    <aside style={{ width: 220, minWidth: 220, borderRight: '1px solid #E8ECF0', background: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo SENA */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #F0F2F5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>SENA</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Portal Coordinador</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Sistema de Gestión</div>
          </div>
        </div>
      </div>

      {/* Usuario logueado */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: '#E8ECF0', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, fontWeight: 700,
          color: '#6B7280', flexShrink: 0, border: '2px solid #D1D5DB',
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Coordinador</div>
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {principalItems.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px 8px', marginBottom: 2 }}>PRINCIPAL</div>
            {principalItems.map(renderItem)}
          </>
        )}
        {toolItems.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 12px 8px', marginBottom: 2 }}>HERRAMIENTAS</div>
            {toolItems.map(renderItem)}
          </>
        )}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1px solid #F0F2F5' }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '9px 12px', border: 'none', borderRadius: 10, background: 'transparent', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 14 }}>→</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

const NAV_ITEMS = [
  { id: 'unit', label: 'Mi Unidad', icon: '🏠' },
  { id: 'report-management', label: 'Gestión de Informes', icon: '📋' },
  { id: 'reports', label: 'Reportes', icon: '📊' },
  { id: 'compliance', label: 'Cumplimiento', icon: '🎯' },
  { id: 'user-management', label: 'Gestión de Usuarios', icon: '👥' },
  { id: 'ai-assistant', label: 'Asistente IA', icon: '🤖' },
  { id: 'notifications', label: 'Notificaciones', icon: '🔔', badge: 3 },
  { id: 'history', label: 'Historial', icon: '🕐' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' },
];

const ICON_MAP = {
  '🏠': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  '📋': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M5 4h2a2 2 0 012 2v1h6V6a2 2 0 012-2h2a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
    </svg>
  ),
  '📊': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  '🎯': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  '👥': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  '🤖': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M12 2v4m-4 5h.01M16 16h.01M8 16h.01M12 16h.01"/><circle cx="12" cy="6" r="2"/>
    </svg>
  ),
  '🔔': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  '🕐': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  '⚙️': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  ),
};

function Sidebar({ activeView, onViewChange, onLogout }) {
  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#fff',
      borderRight: '1px solid #E8ECF0',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 0 24px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F0F2F5', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '-0.3px' }}>SITMI</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Coordinator</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px' }}>
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 2,
                textAlign: 'left',
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                background: active ? '#F0FDF4' : 'transparent',
                color: active ? '#16a34a' : '#6B7280',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#374151'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; } }}
            >
              <span style={{ color: active ? '#16a34a' : '#9CA3AF', transition: 'color .15s', flexShrink: 0 }}>
                {ICON_MAP[item.icon] || item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: '#22c55e', color: '#fff', borderRadius: 20,
                  fontSize: 10, fontWeight: 700, padding: '2px 7px',
                  minWidth: 18, textAlign: 'center',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0 12px' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 10,
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 13.5, color: '#EF4444', fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default function CoordinatorDashboard({ user, onLogout, pendingUsers, setPendingUsers }) {
  const [activeView, setActiveView] = useState('unit');

  const renderView = () => {
    switch (activeView) {
      case 'trash': return <TrashView />;
      case 'unit': return <UnitView userName={user?.name || 'María Coordinadora'} onViewChange={setActiveView} />;
      case 'report-management': return <ReportManagement />;
      case 'reports': return <Reports />;
      case 'compliance': return <ComplianceView />;
      case 'user-management': return <UserManagement pendingUsers={pendingUsers} setPendingUsers={setPendingUsers} />;
      case 'notifications': return <Notifications />;
      case 'history': return <HistoryView />;
      case 'settings': return <SettingsView userName={user?.name || 'María Coordinadora'} />;
      case 'ai-assistant': return <AIAssistant />;
      default: return <UnitView userName={user?.name || 'María Coordinadora'} onViewChange={setActiveView} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F9FC', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <SidebarComponent activeView={activeView} onViewChange={setActiveView} onLogout={onLogout} role="coordinator" userName={user?.name || 'María Coordinadora'} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {renderView()}
      </main>
    </div>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu asistente virtual del SITMI. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre cómo completar informes, fechas de entrega, documentos requeridos y más.' }
  ]);
  const [input, setInput] = useState('');

  const suggestions = [
    '¿Qué documentos necesito para el informe GC?',
    '¿Cuál es la fecha límite para entregar informes?',
    '¿Cómo adjunto evidencias a una obligación?',
    '¿Qué hago si no realicé una actividad?',
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827', display: 'flex', gap: 20, height: 'calc(100vh - 56px)' }}>
      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 014 4v1h1a3 3 0 013 3v6a3 3 0 01-3 3H7a3 3 0 01-3-3V10a3 3 0 013-3h1V6a4 4 0 014-4z"/>
              <circle cx="9" cy="13" r="1" fill="white"/><circle cx="15" cy="13" r="1" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Asistente IA</div>
            <div style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Tu ayudante inteligente para resolver dudas sobre el sistema
            </div>
          </div>
        </div>
        {/* Messages */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'assistant' ? 'flex-start' : 'flex-end' }}>
              {m.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                  <span style={{ color: '#fff', fontSize: 12 }}>✦</span>
                </div>
              )}
              <div style={{
                maxWidth: '72%', padding: '12px 16px', borderRadius: m.role === 'assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                background: m.role === 'assistant' ? '#F7F9FC' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: m.role === 'assistant' ? '#374151' : '#fff',
                fontSize: 14, lineHeight: 1.6,
                border: m.role === 'assistant' ? '1px solid #E8ECF0' : 'none',
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F2F5', display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { setMessages([...messages, { role: 'user', text: input }]); setInput(''); } }}
            placeholder="Escribe tu pregunta aquí..."
            style={{ flex: 1, padding: '11px 16px', borderRadius: 12, border: '1px solid #E8ECF0', fontSize: 14, background: '#F7F9FC', outline: 'none', color: '#374151' }}
          />
          <button
            onClick={() => { if (input.trim()) { setMessages([...messages, { role: 'user', text: input }]); setInput(''); } }}
            style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar suggestions */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #E8ECF0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>✦</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Sugerencias</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} style={{
                textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: '1px solid #E8ECF0',
                background: '#F7F9FC', fontSize: 13, color: '#374151', cursor: 'pointer', lineHeight: 1.4,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F7F9FC'; e.currentTarget.style.borderColor = '#E8ECF0'; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: '#F0FDF4', borderRadius: 16, padding: '20px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#15803d', marginBottom: 12 }}>Ayuda rápida</div>
          {['Pregunta sobre cualquier proceso', 'Obtén información de fechas', 'Consulta requisitos de informes', 'Resuelve dudas técnicas'].map((tip, i) => (
            <div key={i} style={{ fontSize: 13, color: '#166534', marginBottom: 6, display: 'flex', gap: 6 }}>
              <span>•</span><span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}