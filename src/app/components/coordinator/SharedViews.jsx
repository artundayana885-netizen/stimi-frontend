import { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { changePassword, updateProfile } from '../../../services/authService';

/* ============================================================
   ICONOS — línea profesional, 2px de trazo, sin relleno.
   Sustituyen a los emojis en todo el módulo.
   ============================================================ */
const Icon = ({ children, size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

const IconBell = (p) => <Icon {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></Icon>;
const IconAlertTriangle = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Icon>;
const IconFileText = (p) => <Icon {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" /></Icon>;
const IconMoon = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></Icon>;
const IconUser = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>;
const IconUserCheck = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></Icon>;
const IconXCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></Icon>;
const IconEye = (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>;
const IconEyeOff = (p) => <Icon {...p}><path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.27 21.27 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.27 21.27 0 01-2.16 3.19" /><path d="M14.12 14.12a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></Icon>;
const IconShieldCheck = (p) => <Icon {...p}><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" /><polyline points="9 12 11 14 15 10" /></Icon>;
const IconEdit = (p) => <Icon {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></Icon>;
const IconSave = (p) => <Icon {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Icon>;
const IconX = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
const IconBuilding = (p) => <Icon {...p}><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="7" x2="9" y2="7.01" /><line x1="15" y1="7" x2="15" y2="7.01" /><line x1="9" y1="11" x2="9" y2="11.01" /><line x1="15" y1="11" x2="15" y2="11.01" /><line x1="9" y1="15" x2="9" y2="15.01" /><line x1="15" y1="15" x2="15" y2="15.01" /></Icon>;

/* ============================================================
   Paleta institucional SENA vigente (Manual de Identidad Visual
   2022-2026, actualizado por Resolución 1825 de 2024)
   ============================================================ */
const BRAND = {
  greenDark: '#007832',
  green: '#1F9B0A',
  greenMid: '#39A900',
  greenSoft: '#6BC93A',
  orange: '#D4571A',
  orangeMid: '#FC7323',
  orangeSoft: '#FD9257',
  danger: '#dc2626',
};

/* ============================================================
   REGISTRO DE HISTORIAL — cualquier acción que el usuario haga
   en el panel se guarda aquí y aparece en HistoryView en tiempo
   real (misma pestaña y otras pestañas abiertas).
   ============================================================ */
const HISTORY_KEY = 'sena_history';
const HISTORY_EVENT = 'sena-history-updated';

/**
 * Registra un movimiento del usuario en el historial.
 * kind: 'approved' | 'rejected' | 'system'  -> controla el color/ícono en HistoryView
 * type: etiqueta corta que se muestra como "chip" (ej: 'Perfil', 'Seguridad', 'Notificaciones', 'Informes')
 *
 * EXPORTADA para poder llamarla desde otros componentes del panel de
 * coordinador (ej. ReportManagement.jsx al aprobar/rechazar un informe).
 */
export function addHistoryEntry({ action, detail, by, type = 'Sistema', kind = 'system' }) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const now = new Date();
    const entry = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      action,
      detail,
      by: by || 'Tú',
      type,
      kind,
      month: now.toLocaleDateString('es-CO', { month: 'long' }),
      date: now.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    };
    const updated = [entry, ...existing];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    // Avisa a cualquier HistoryView montado (misma pestaña) que hay un cambio.
    window.dispatchEvent(new Event(HISTORY_EVENT));
  } catch (err) {
    console.error('No se pudo registrar el movimiento en el historial', err);
  }
}

function Banner({ eyebrow, title, subtitle, icon }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${BRAND.greenDark} 0%, ${BRAND.green} 55%, ${BRAND.greenMid} 100%)`,
      borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -30, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(252,115,35,0.16)' }} />
      <div style={{ position: 'absolute', right: 40, bottom: -50, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{eyebrow}</span>
      </div>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', position: 'relative' }}>{title}</h1>
      <p style={{ margin: 0, fontSize: 13, opacity: 0.85, position: 'relative' }}>{subtitle}</p>
    </div>
  );
}

/* ============================================================
   NOTIFICACIONES
   ============================================================ */
function useNotifStyle(theme) {
  return {
    danger:  { color: BRAND.danger,    bg: theme === 'dark' ? 'rgba(220,38,38,0.16)'  : '#FEF2F2', Icon: IconAlertTriangle },
    success: { color: BRAND.greenSoft, bg: theme === 'dark' ? 'rgba(107,201,58,0.16)' : '#EAF6DE', Icon: IconCheckCircle },
    info:    { color: BRAND.orangeMid, bg: theme === 'dark' ? 'rgba(252,115,35,0.16)' : '#FFF1E8', Icon: IconFileText },
  };
}

const FALLBACK_NOTIFICATIONS = [];

export function Notifications({ notifications: externalNotifications, setNotifications: setExternalNotifications }) {
  const { colors, theme } = useTheme();
  const NOTIF_STYLE = useNotifStyle(theme);
  const [filter, setFilter] = useState('Todas');
  const [localNotifications, setLocalNotifications] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('sena_coord_notifications') || '[]');
    return saved.length > 0 ? saved : FALLBACK_NOTIFICATIONS;
  });

  const notifications = externalNotifications ?? localNotifications;
  const setNotifications = setExternalNotifications ?? setLocalNotifications;

  useEffect(() => {
    localStorage.setItem('sena_coord_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unread = notifications.filter(n => !n.read).length;

  const markOne = (id) => {
    const target = notifications.find(n => n.id === id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    if (target) {
      addHistoryEntry({
        action: 'Notificación leída',
        detail: target.title || target.message || 'Notificación marcada como leída',
        type: 'Notificaciones',
        kind: 'system',
      });
    }
  };

  const shown = notifications.filter(n =>
    filter === 'Todas' ? true : filter === 'No leídas' ? !n.read : n.type === 'danger'
  );

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: colors.text }}>
      <Banner eyebrow="Centro de notificaciones" title="Notificaciones" subtitle="Alertas y actualizaciones del sistema para tu unidad" icon={<IconBell size={17} />} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['Todas', 'No leídas', 'Alertas'].map((t) => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === t ? BRAND.greenMid : colors.card,
            color: filter === t ? '#fff' : colors.textSecondary,
            border: filter === t ? `1px solid ${BRAND.greenMid}` : `1px solid ${colors.borderStrong}`,
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
          }}>
            {t}
            {t === 'No leídas' && unread > 0 && (
              <span style={{ background: BRAND.orangeMid, color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{unread}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shown.length === 0 && (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: colors.textMuted, fontSize: 13.5, background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}` }}>
            No hay notificaciones en esta categoría.
          </div>
        )}
        {shown.map((n) => {
          const style = NOTIF_STYLE[n.type] || NOTIF_STYLE.info;
          const NotifIcon = style.Icon;
          return (
            <div key={n.id} style={{
              background: colors.card, borderRadius: 14, padding: '16px 20px',
              border: `1px solid ${n.read ? colors.border : colors.borderStrong}`,
              borderLeft: n.read ? `1px solid ${colors.border}` : `3px solid ${style.color}`,
              boxShadow: n.read ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              opacity: n.read ? 0.75 : 1,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.color, flexShrink: 0 }}>
                <NotifIcon size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <strong style={{ fontSize: 14, color: n.read ? colors.textMuted : colors.text }}>{n.title}</strong>
                  {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: style.color, display: 'inline-block' }} />}
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}>{n.message}</p>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  {!n.read && (
                    <button onClick={() => markOne(n.id)} style={{ fontSize: 12, color: BRAND.greenMid, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                      Marcar como leída
                    </button>
                  )}
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

/* ============================================================
   HISTORIAL — ahora se mantiene sincronizado en vivo con
   addHistoryEntry(), incluyendo cambios hechos en otras pestañas.
   ============================================================ */
function useHistoryStyle(theme) {
  return {
    approved: { color: BRAND.greenSoft, bg: theme === 'dark' ? 'rgba(107,201,58,0.16)' : '#EAF6DE', Icon: IconCheckCircle },
    rejected: { color: BRAND.danger,    bg: theme === 'dark' ? 'rgba(220,38,38,0.16)'  : '#FEF2F2', Icon: IconXCircle },
    system:   { color: BRAND.orangeMid, bg: theme === 'dark' ? 'rgba(252,115,35,0.16)' : '#FFF1E8', Icon: IconUserCheck },
  };
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function HistoryView() {
  const { colors, theme } = useTheme();
  const HISTORY_STYLE = useHistoryStyle(theme);
  const [historyItems, setHistoryItems] = useState(loadHistory);

  useEffect(() => {
    const reload = () => setHistoryItems(loadHistory());
    // Se dispara cuando addHistoryEntry() se llama en esta misma pestaña...
    window.addEventListener(HISTORY_EVENT, reload);
    // ...y esto cubre cambios hechos en otras pestañas del mismo navegador.
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(HISTORY_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: colors.text }}>
      <Banner eyebrow="Registro" title="Historial de actividades" subtitle="Todas las acciones registradas en el sistema" icon={<IconClock size={17} />} />

      <div style={{ background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {historyItems.length === 0 && (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: colors.textMuted, fontSize: 13.5 }}>
            No hay actividades registradas todavía.
          </div>
        )}
        {historyItems.map((item, i) => {
          const style = HISTORY_STYLE[item.kind] || HISTORY_STYLE.system;
          const HistIcon = style.Icon;
          return (
            <div key={item.id} style={{
              display: 'flex', padding: '14px 20px', alignItems: 'center', gap: 14,
              borderBottom: i < historyItems.length - 1 ? `1px solid ${colors.border}` : 'none',
              transition: 'background .1s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.border)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.color, flexShrink: 0 }}>
                <HistIcon size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{item.instructor || item.detail}</div>
                <div style={{ fontSize: 12, color: colors.textMuted }}>por {item.by || 'Instructor'}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: style.color, minWidth: 130 }}>{item.action}</span>
              <span style={{ fontSize: 12, padding: '3px 10px', background: colors.border, borderRadius: 6, color: colors.textSecondary }}>{item.type || '-'}</span>
              <span style={{ fontSize: 12, color: colors.textSecondary, minWidth: 70 }}>{item.month || '-'}</span>
              <span style={{ fontSize: 12, color: colors.textFaint }}>{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   CONFIGURACIÓN (incluye Seguridad con validación de contraseña)
   ============================================================ */

function evaluatePassword(pass) {
  return {
    length:  pass.length >= 8,
    upper:   /[A-Z]/.test(pass),
    lower:   /[a-z]/.test(pass),
    number:  /[0-9]/.test(pass),
    special: /[^A-Za-z0-9]/.test(pass),
  };
}

const PASSWORD_RULES = [
  { key: 'length',  label: 'Mínimo 8 caracteres' },
  { key: 'upper',   label: 'Al menos una mayúscula (A-Z)' },
  { key: 'lower',   label: 'Al menos una minúscula (a-z)' },
  { key: 'number',  label: 'Al menos un número (0-9)' },
  { key: 'special', label: 'Al menos un carácter especial (!@#$%...)' },
];

function RequirementRow({ ok, label, touched }) {
  const { colors } = useTheme();
  const color = !touched ? colors.textFaint : ok ? BRAND.greenSoft : colors.textMuted;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color, transition: 'color .15s' }}>
      <span style={{ display: 'flex', flexShrink: 0 }}>
        {ok && touched ? <IconCheckCircle size={14} /> : <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${color}`, display: 'inline-block' }} />}
      </span>
      {label}
    </div>
  );
}

function PasswordField({ label, value, onChange, showToggle, visible, onToggleVisible }) {
  const { colors } = useTheme();
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 40px 10px 12px', borderRadius: 8,
            border: `1px solid ${colors.borderStrong}`, background: colors.inputBg, color: colors.text,
            fontSize: 14, outline: 'none',
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggleVisible}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, display: 'flex' }}
            title={visible ? 'Ocultar' : 'Mostrar'}
          >
            {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, activeColor = BRAND.greenMid }) {
  const { theme } = useTheme();
  return (
    <div
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
      style={{
        width: 42, height: 24, borderRadius: 12,
        background: checked ? activeColor : (theme === 'dark' ? '#4B5563' : '#D1D5DB'),
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background .2s', outline: 'none',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: checked ? 20 : 2,
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

const NOTIF_PREFS = [
  { key: 'informesPendientes', label: 'Notificar informes pendientes' },
  { key: 'nuevosRegistros',    label: 'Notificar nuevos registros' },
  { key: 'resumenSemanal',     label: 'Resumen semanal por email' },
  { key: 'alertasCumplimiento', label: 'Alertas de cumplimiento bajo' },
];

const DEFAULT_NOTIF_PREFS = NOTIF_PREFS.reduce((acc, p) => ({ ...acc, [p.key]: true }), {});

function SectionCard({ icon, iconBg, title, children, headerAction }) {
  const { colors } = useTheme();
  return (
    <div style={{ background: colors.card, borderRadius: 14, padding: 24, marginBottom: 16, border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          {icon}
        </div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.text, flex: 1 }}>{title}</h2>
        {headerAction}
      </div>
      {children}
    </div>
  );
}

const PROFILE_FIELDS = [
  { key: 'nombre', label: 'Nombre completo', editable: true },
  // Rol y Centro de formación son de solo lectura aquí a propósito: el rol
  // lo asigna el coordinador desde "Gestión de Usuarios" y el centro de
  // formación viene de la sede/área asignada al registrar la cuenta — no
  // tiene sentido dejar que el propio usuario los cambie desde su perfil.
  { key: 'rol', label: 'Rol', editable: false },
  { key: 'email', label: 'Email', editable: true, type: 'email' },
  { key: 'unidad', label: 'Centro de formación', editable: false },
];

function ProfileField({ label, value, editing, onChange, type = 'text', editable = true }) {
  const { colors } = useTheme();
  const isEditingThisField = editing && editable;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      {isEditingThisField ? (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={`Ingresa ${label.toLowerCase()}`}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8,
            border: `1px solid ${BRAND.greenMid}`, background: colors.inputBg, color: colors.text,
            fontSize: 14, outline: 'none',
          }}
        />
      ) : (
        <div style={{ padding: '10px 12px', background: colors.inputBg, borderRadius: 8, fontSize: 14, border: `1px solid ${colors.border}`, color: value ? colors.text : colors.textFaint }}>
          {value || 'No especificado'}
        </div>
      )}
    </div>
  );
}

export function SettingsView({ userName, darkMode = false, onToggleDarkMode }) {
  const { colors, theme } = useTheme();
  const savedUser = JSON.parse(localStorage.getItem('sena_user') || '{}');
  const userEmail = savedUser.email || '';
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [touched, setTouched] = useState(false);
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sena_notif_prefs') || 'null');
      return saved ? { ...DEFAULT_NOTIF_PREFS, ...saved } : DEFAULT_NOTIF_PREFS;
    } catch {
      return DEFAULT_NOTIF_PREFS;
    }
  });

  const [editingProfile, setEditingProfile] = useState(false);
  // Rol y "Centro de formación" (unidad) vienen del backend real —
  // ANTES se leían de localStorage con `savedUser.rol`/`savedUser.unidad`,
  // campos que el login nunca guardaba, por eso siempre salían "No
  // especificado" aunque el coordinador ya te hubiera asignado un rol y
  // área/sede/centro reales. Ahora usan `savedUser.role` y
  // `savedUser.centro`, que sí llegan del backend.
  const [profileData, setProfileData] = useState(() => ({
    nombre: userName || savedUser.name || '',
    rol: savedUser.role ? (savedUser.role === 'coordinator' ? 'Coordinador' : 'Instructor') : '',
    email: userEmail,
    unidad: savedUser.centro || savedUser.area || '',
  }));
  const [profileForm, setProfileForm] = useState(profileData);

  useEffect(() => {
    localStorage.setItem('sena_notif_prefs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  const togglePref = (key) => {
    setNotifPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const label = NOTIF_PREFS.find(p => p.key === key)?.label || key;
      addHistoryEntry({
        action: 'Preferencia actualizada',
        detail: `${label}: ${next[key] ? 'activada' : 'desactivada'}`,
        type: 'Notificaciones',
        kind: 'system',
      });
      return next;
    });
  };

  const checks = evaluatePassword(newPass);
  const isPasswordStrong = Object.values(checks).every(Boolean);
  const passwordsMatch = newPass.length > 0 && newPass === confPass;

  const showToast = (msg, color = BRAND.greenSoft) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3200);
  };

  const handleStartEditProfile = () => {
    setProfileForm(profileData);
    setEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setProfileForm(profileData);
    setEditingProfile(false);
  };

  const handleProfileFieldChange = (key) => (e) => {
    setProfileForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    if (!profileForm.nombre.trim()) {
      showToast('El nombre completo es obligatorio', BRAND.danger);
      return;
    }
    if (!profileForm.email.trim()) {
      showToast('El email es obligatorio', BRAND.danger);
      return;
    }
    if (!savedUser.id) {
      showToast('No se pudo identificar tu cuenta; vuelve a iniciar sesión.', BRAND.danger);
      return;
    }

    try {
      // Guarda de verdad en la base de datos (antes solo se guardaba en
      // localStorage, así que se perdía al cambiar de navegador/dispositivo
      // o borrar caché). El rol y el centro de formación no se envían:
      // esos los asigna el coordinador, no se editan desde aquí.
      await updateProfile(savedUser.id, {
        nombre: profileForm.nombre,
        correo: profileForm.email,
      });
      setProfileData(profileForm);
      setEditingProfile(false);
      showToast('Perfil actualizado exitosamente');
      addHistoryEntry({
        action: 'Perfil actualizado',
        detail: `Se actualizó la información de perfil de ${profileForm.nombre}`,
        by: profileForm.nombre,
        type: 'Perfil',
        kind: 'approved',
      });
    } catch (err) {
      showToast(err.message || 'No se pudo guardar la información del perfil', BRAND.danger);
    }
  };

  const handlePasswordChange = async () => {
    setTouched(true);
    if (!currPass) {
      showToast('Ingresa tu contraseña actual', BRAND.danger);
      return;
    }
    if (!isPasswordStrong) {
      showToast('La nueva contraseña no cumple los requisitos de seguridad', BRAND.danger);
      return;
    }
    if (!passwordsMatch) {
      showToast('Las contraseñas nuevas no coinciden', BRAND.danger);
      return;
    }
    try {
      await changePassword(userEmail, currPass, newPass);
      showToast('Contraseña actualizada exitosamente');
      addHistoryEntry({
        action: 'Contraseña cambiada',
        detail: 'La contraseña de la cuenta fue actualizada',
        type: 'Seguridad',
        kind: 'approved',
      });
      setCurrPass('');
      setNewPass('');
      setConfPass('');
      setTouched(false);
    } catch (err) {
      showToast(err.message || 'Error al cambiar la contraseña', BRAND.danger);
      addHistoryEntry({
        action: 'Intento fallido',
        detail: err.message || 'Error al cambiar la contraseña',
        type: 'Seguridad',
        kind: 'rejected',
      });
    }
  };

  const handleToggleDarkMode = () => {
    const goingTo = darkMode ? 'claro' : 'oscuro';
    onToggleDarkMode?.();
    addHistoryEntry({
      action: 'Apariencia cambiada',
      detail: `Modo ${goingTo} activado`,
      type: 'Apariencia',
      kind: 'system',
    });
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: colors.text }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.color, color: '#fff', padding: '12px 20px',
          borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.color === BRAND.danger ? <IconAlertTriangle size={16} /> : <IconCheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <Banner eyebrow="Sistema" title="Configuración" subtitle="Personaliza tu cuenta y tus preferencias" icon={<IconSettings size={17} />} />

      {/* Apariencia */}
      <SectionCard icon={<IconMoon size={18} />} iconBg={`linear-gradient(135deg, ${BRAND.orangeMid}, ${BRAND.orange})`} title="Apariencia">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Modo oscuro</div>
            <div style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
              {darkMode ? 'Activado — interfaz con colores oscuros' : 'Desactivado — interfaz con colores claros'}
            </div>
          </div>
          <Toggle checked={darkMode} onChange={handleToggleDarkMode} />
        </div>
      </SectionCard>

      {/* Perfil */}
      <SectionCard
        icon={<IconUser size={18} />}
        iconBg={`linear-gradient(135deg, ${BRAND.greenSoft}, ${BRAND.greenMid})`}
        title="Perfil de usuario"
        headerAction={
          editingProfile ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCancelEditProfile}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                  border: `1px solid ${colors.borderStrong}`, background: 'transparent', color: colors.textSecondary,
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <IconX size={14} /> Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                  border: 'none', background: `linear-gradient(135deg, ${BRAND.greenSoft}, ${BRAND.greenMid})`,
                  color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(57,169,0,0.3)',
                }}
              >
                <IconSave size={14} /> Guardar
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEditProfile}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                border: `1px solid ${BRAND.greenMid}`, background: 'transparent', color: BRAND.greenMid,
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme === 'dark' ? 'rgba(107,201,58,0.12)' : '#EAF6DE'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <IconEdit size={14} /> Editar información
            </button>
          )
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: theme === 'dark' ? 'rgba(107,201,58,0.16)' : '#EAF6DE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 700, color: BRAND.greenMid,
            border: `3px solid ${theme === 'dark' ? 'rgba(107,201,58,0.35)' : '#C0DD97'}`,
          }}>
            {(profileData.nombre || '').split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>{profileData.nombre || ''}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              {profileData.rol && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20,
                  background: theme === 'dark' ? 'rgba(107,201,58,0.16)' : '#EAF6DE', color: BRAND.greenMid,
                  fontSize: 12, fontWeight: 700,
                }}>
                  <IconUserCheck size={12} /> {profileData.rol}
                </span>
              )}
              {profileData.unidad && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20,
                  background: theme === 'dark' ? 'rgba(252,115,35,0.16)' : '#FFF1E8', color: BRAND.orangeMid,
                  fontSize: 12, fontWeight: 700,
                }}>
                  <IconBuilding size={12} /> {profileData.unidad}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {PROFILE_FIELDS.map((f) => (
            <ProfileField
              key={f.key}
              label={f.label}
              value={editingProfile ? profileForm[f.key] : profileData[f.key]}
              editing={editingProfile}
              editable={f.editable}
              type={f.type}
              onChange={handleProfileFieldChange(f.key)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Seguridad */}
      <SectionCard icon={<IconLock size={18} />} iconBg={`linear-gradient(135deg, ${BRAND.orangeMid}, ${BRAND.orange})`} title="Seguridad">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <PasswordField
            label="Contraseña actual"
            value={currPass}
            onChange={(e) => setCurrPass(e.target.value)}
            showToggle
            visible={showCurr}
            onToggleVisible={() => setShowCurr(v => !v)}
          />
          <PasswordField
            label="Nueva contraseña"
            value={newPass}
            onChange={(e) => { setNewPass(e.target.value); setTouched(true); }}
            showToggle
            visible={showNew}
            onToggleVisible={() => setShowNew(v => !v)}
          />

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px',
            padding: '12px 14px', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
            borderRadius: 10, border: `1px solid ${colors.border}`,
          }}>
            {PASSWORD_RULES.map(rule => (
              <RequirementRow key={rule.key} ok={checks[rule.key]} label={rule.label} touched={touched} />
            ))}
          </div>

          <PasswordField
            label="Confirmar nueva contraseña"
            value={confPass}
            onChange={(e) => { setConfPass(e.target.value); setTouched(true); }}
            showToggle
            visible={showConf}
            onToggleVisible={() => setShowConf(v => !v)}
          />
          {confPass.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: passwordsMatch ? BRAND.greenSoft : BRAND.danger, marginTop: -6 }}>
              {passwordsMatch ? <IconCheckCircle size={13} /> : <IconAlertTriangle size={13} />}
              {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            style={{
              alignSelf: 'flex-start', padding: '10px 22px', borderRadius: 10,
              border: 'none', background: `linear-gradient(135deg, ${BRAND.greenSoft}, ${BRAND.greenMid})`,
              color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(57,169,0,0.3)', transition: 'transform .1s, box-shadow .1s',
              marginTop: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(57,169,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(57,169,0,0.3)'; }}
          >
            <IconShieldCheck size={15} />
            Cambiar contraseña
          </button>
        </div>
      </SectionCard>

      {/* Notificaciones */}
      <SectionCard icon={<IconBell size={18} />} iconBg={`linear-gradient(135deg, ${BRAND.greenSoft}, ${BRAND.greenMid})`} title="Preferencias de notificaciones">
        {NOTIF_PREFS.map((pref, i, arr) => (
          <div key={pref.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
            <span style={{ fontSize: 14, color: colors.textSecondary }}>{pref.label}</span>
            <Toggle checked={notifPrefs[pref.key]} onChange={() => togglePref(pref.key)} />
          </div>
        ))}
      </SectionCard>
    </div>
  );
}