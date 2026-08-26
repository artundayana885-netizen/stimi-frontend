import { useState, useEffect } from 'react';
import Toast from '../Toast';
import { useTheme } from '../../../ThemeContext';
import { getAllUsers, toggleUserStatus, changeUserRole, deleteUser } from '../../../services/authService';
import { addHistoryEntry } from './historyLog';

const ROLES = ['Instructor', 'Coordinador'];

const AREAS = [
  'Gestión Administrativa',
  'Gestión Empresarial',
  'Gestión de Mercados',
  'Contabilidad y Finanzas',
  'Análisis y Desarrollo de Sistemas de Información',
  'Gestión de Redes de Datos',
  'Producción de Multimedia',
  'Producción Agropecuaria Ecológica',
  'Agricultura de Precisión',
  'Control Ambiental',
  'Gestión de Recursos Naturales',
  'Guianza Turística',
  'Gestión de Servicios Turísticos',
];

/* ---------------------------------------------------------------------
   Set de iconos de línea (reemplaza los emojis) — trazo consistente,
   1.8px, esquinas redondeadas, hereda color por prop. Sin dependencias.
--------------------------------------------------------------------- */
const iconBase = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function IconUsers({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <path d="M16 21v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 19.5V21" />
      <circle cx="9" cy="8" r="3.25" />
      <path d="M17.5 21v-1.5a3.3 3.3 0 0 0-2.2-3.1" />
      <path d="M14.3 4.2a3.25 3.25 0 0 1 0 6.3" />
    </svg>
  );
}
function IconCheckCircle({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.3 2.6 2.6 5-5.2" />
    </svg>
  );
}
function IconBan({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <circle cx="12" cy="12" r="9" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
function IconTarget({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.15" fill={color} stroke="none" />
    </svg>
  );
}
function IconClock({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </svg>
  );
}
function IconMail({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <rect x="3.25" y="5.5" width="17.5" height="13" rx="2.2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
function IconTrash({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.2c0-.66.54-1.2 1.2-1.2h2.6c.66 0 1.2.54 1.2 1.2V7" />
      <path d="M6.3 7l.7 12a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9l.7-12" />
      <path d="M10.2 11v6M13.8 11v6" />
    </svg>
  );
}
function IconRefresh({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...iconBase}>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.7-5.4M19.5 12a7.5 7.5 0 0 1-12.7 5.4" />
      <path d="M17 3.6V7h-3.4M7 20.4V17h3.4" />
    </svg>
  );
}

// Pequeño brote (sprout) — guiño al espíritu de "formación / crecimiento" del SENA
function SproutIcon({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M12 10c0-3.5-2.5-6-7-6 0 4.5 2.5 7 7 7" />
      <path d="M12 13c0-3.9 2.8-6.7 7.5-6.7 0 4.9-2.8 7.7-7.5 7.7" />
    </svg>
  );
}

function IconBox({ children, bg, size = 38, radius = 10 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  const { colors } = useTheme();
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24, backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div style={{
        background: colors.card, borderRadius: 20, padding: 28, width: 'min(480px,100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.text }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: colors.inputBg, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: colors.textMuted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, bg, color, hoverBg }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 14px', borderRadius: 8, border: 'none',
        background: hover ? hoverBg : bg, color: color,
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: hover ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

// Botón con icono + texto alineados (reemplaza los botones que llevaban emoji)
function IconButton({ icon, label, onClick, bg, color, disabled, full }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? '100%' : undefined,
      padding: '11px 16px', borderRadius: 10, border: 'none',
      background: bg, color, fontWeight: 700, fontSize: 13, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {icon}{label}
    </button>
  );
}

// Barra de cumplimiento — pequeño detalle propio en vez de solo el número
function ComplianceBar({ value, color, trackColor }) {
  return (
    <div style={{ width: 64, height: 5, borderRadius: 3, background: trackColor, overflow: 'hidden', marginTop: 5 }}>
      <div style={{
        width: `${Math.min(value, 100)}%`, height: '100%', borderRadius: 3,
        background: color, transition: 'width .3s ease',
      }} />
    </div>
  );
}

const REGISTER_COLORS = ['#2E8B00', '#F97316', '#39A900', '#EA580C', '#65A30D'];

export default function UserManagement({ pendingUsers = [], setPendingUsers, onAssignRole, onRejectUser, notifications = [], setNotifications }) {
  const { colors, theme } = useTheme();
  const [dbUsers, setDbUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [roleModal, setRoleModal] = useState(null);   // instructor obj
  const [statusModal, setStatusModal] = useState(null); // instructor obj (activar/desactivar)
  const [deleteModal, setDeleteModal] = useState(null); // instructor obj
  const [selectedRole, setSelectedRole] = useState('');

  // Modal para asignar rol a un usuario recién registrado (sin rol todavía)
  const [assignModal, setAssignModal] = useState(null); // registro pendiente obj
  const [assignRole, setAssignRole] = useState('');
  const [rejectModal, setRejectModal] = useState(null); // registro pendiente obj

  const showToast = (msg, color = '#2E8B00') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setDbUsers(data);
    } catch (err) {
      console.error(err);
      showToast('Error al obtener los usuarios de la base de datos', '#ef4444');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Map dbUsers to allInstructors format
  const allInstructors = dbUsers.map((u, idx) => {
    const isPending = u.estado === 'Pendiente';
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      // Cumplimiento real del usuario si existe; si no hay dato aún, se
      // deja en null en vez de inventar un número aleatorio.
      compliance: u.compliance ?? null,
      area: u.area || 'Sin asignar',
      lastReport: u.lastReport || 'Sin informes aún',
      initials: u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: REGISTER_COLORS[idx % REGISTER_COLORS.length],
      bg: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#F7F9FC',
      role: isPending ? null : (u.role.charAt(0).toUpperCase() + u.role.slice(1)),
      active: u.active
    };
  });

  const pendingApproval = allInstructors.filter((u) => !u.role);

  const handleAssignRoleToPending = async () => {
    if (!assignRole || !assignModal) return;
    const roleLabel = assignRole === 'instructor' ? 'Instructor' : 'Coordinador';
    try {
      const result = await changeUserRole(assignModal.id, assignRole);
      // Igual que en "Olvidé mi contraseña": si el correo de notificación
      // no logró enviarse, se lo hacemos saber al coordinador en pantalla
      // en vez de dejarlo pasar en silencio (la acción ya se aplicó igual).
      showToast(
        result?.emailSent === false
          ? `Rol de ${roleLabel} asignado a ${assignModal.name}, pero no se pudo enviar el correo de notificación.`
          : `Rol de ${roleLabel} asignado a ${assignModal.name}.`,
        result?.emailSent === false ? '#eab308' : '#2E8B00'
      );
      addHistoryEntry({
        action: 'Rol asignado',
        detail: `Se asignó el rol de ${roleLabel} a ${assignModal.name} (${assignModal.email})${result?.emailSent === false ? ' — el correo de notificación no se pudo enviar' : ''}`,
        by: assignModal.name,
        type: 'Usuarios',
        kind: 'approved',
      });
      setAssignModal(null);
      setAssignRole('');
      fetchUsers();
    } catch (err) {
      showToast(`Error: ${err.message}`, '#ef4444');
      addHistoryEntry({
        action: 'Error al asignar rol',
        detail: `No se pudo asignar el rol de ${roleLabel} a ${assignModal.name}: ${err.message}`,
        by: assignModal.name,
        type: 'Usuarios',
        kind: 'rejected',
      });
    }
  };

  const handleRejectPending = async () => {
    if (!rejectModal) return;
    try {
      const result = await deleteUser(rejectModal.id);
      showToast(
        result?.emailSent === false
          ? `Registro de ${rejectModal.name} rechazado, pero no se pudo enviar el correo de notificación.`
          : `Registro de ${rejectModal.name} rechazado`,
        '#ef4444'
      );
      addHistoryEntry({
        action: 'Registro rechazado',
        detail: `Se rechazó la solicitud de registro de ${rejectModal.name} (${rejectModal.email})${result?.emailSent === false ? ' — el correo de notificación no se pudo enviar' : ''}`,
        by: rejectModal.name,
        type: 'Usuarios',
        kind: 'rejected',
      });
      setRejectModal(null);
      fetchUsers();
    } catch (err) {
      showToast(`Error: ${err.message}`, '#ef4444');
      addHistoryEntry({
        action: 'Error al rechazar',
        detail: `No se pudo rechazar el registro de ${rejectModal.name}: ${err.message}`,
        by: rejectModal.name,
        type: 'Usuarios',
        kind: 'rejected',
      });
    }
  };

  const handleChangeRole = async () => {
    const previousRole = roleModal.role;
    try {
      const result = await changeUserRole(roleModal.id, selectedRole.toLowerCase());
      showToast(
        result?.emailSent === false
          ? `Rol de ${roleModal.name} cambiado a ${selectedRole}, pero no se pudo enviar el correo de notificación.`
          : `Rol de ${roleModal.name} cambiado a ${selectedRole}`,
        result?.emailSent === false ? '#eab308' : '#2E8B00'
      );
      addHistoryEntry({
        action: 'Rol cambiado',
        detail: `El rol de ${roleModal.name} cambió de ${previousRole} a ${selectedRole}${result?.emailSent === false ? ' — el correo de notificación no se pudo enviar' : ''}`,
        by: roleModal.name,
        type: 'Usuarios',
        kind: 'system',
      });
      setRoleModal(null);
      fetchUsers();
    } catch (err) {
      showToast(`Error: ${err.message}`, '#ef4444');
      addHistoryEntry({
        action: 'Error al cambiar rol',
        detail: `No se pudo cambiar el rol de ${roleModal.name} a ${selectedRole}: ${err.message}`,
        by: roleModal.name,
        type: 'Usuarios',
        kind: 'rejected',
      });
    }
  };

  const handleToggleStatus = async () => {
    const wasActive = statusModal.active !== false;
    try {
      const result = await toggleUserStatus(statusModal.id);
      const baseMsg = wasActive ? `${statusModal.name} fue desactivado` : `${statusModal.name} fue activado de nuevo`;
      showToast(
        result?.emailSent === false ? `${baseMsg}, pero no se pudo enviar el correo de notificación.` : baseMsg,
        result?.emailSent === false ? '#eab308' : (wasActive ? '#ef4444' : '#2E8B00')
      );
      addHistoryEntry({
        action: wasActive ? 'Usuario desactivado' : 'Usuario activado',
        detail: (wasActive
          ? `${statusModal.name} (${statusModal.email}) fue desactivado`
          : `${statusModal.name} (${statusModal.email}) fue reactivado`) + (result?.emailSent === false ? ' — el correo de notificación no se pudo enviar' : ''),
        by: statusModal.name,
        type: 'Usuarios',
        kind: wasActive ? 'rejected' : 'approved',
      });
      setStatusModal(null);
      fetchUsers();
    } catch (err) {
      showToast(`Error: ${err.message}`, '#ef4444');
      addHistoryEntry({
        action: 'Error al cambiar estado',
        detail: `No se pudo ${wasActive ? 'desactivar' : 'activar'} a ${statusModal.name}: ${err.message}`,
        by: statusModal.name,
        type: 'Usuarios',
        kind: 'rejected',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteUser(deleteModal.id);
      showToast(
        result?.emailSent === false
          ? `${deleteModal.name} eliminado del sistema, pero no se pudo enviar el correo de notificación.`
          : `${deleteModal.name} eliminado del sistema`,
        '#ef4444'
      );
      addHistoryEntry({
        action: 'Usuario eliminado',
        detail: `${deleteModal.name} (${deleteModal.email}) fue eliminado del sistema${result?.emailSent === false ? ' — el correo de notificación no se pudo enviar' : ''}`,
        by: deleteModal.name,
        type: 'Usuarios',
        kind: 'rejected',
      });
      setDeleteModal(null);
      fetchUsers();
    } catch (err) {
      showToast(`Error: ${err.message}`, '#ef4444');
      addHistoryEntry({
        action: 'Error al eliminar',
        detail: `No se pudo eliminar a ${deleteModal.name}: ${err.message}`,
        by: deleteModal.name,
        type: 'Usuarios',
        kind: 'rejected',
      });
    }
  };

  // CORREGIDO: antes esta función escribía directamente en localStorage bajo
  // la clave 'sena_notifications' (una clave distinta a la que realmente lee
  // el sidebar/las vistas). Nunca tocaba el estado React `notifications`, así
  // que el badge de la campana jamás se enteraba de estas notificaciones.
  // Ahora actualiza el estado compartido `notifications` vía `setNotifications`,
  // que es la misma fuente que usa CoordinatorDashboard para calcular el
  // contador de no leídas y que usa la vista de Notificaciones para mostrarlas.
  const handleMassNotify = () => {
    if (!message.trim()) return;
    if (typeof setNotifications !== 'function') {
      showToast('No se pudo enviar: falta conectar el estado de notificaciones', '#ef4444');
      return;
    }
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO');
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const newNotif = {
      id: Date.now(),
      type: 'info',
      title: 'Aviso de Coordinación',
      message: `${message} (${dateStr} ${timeStr})`,
      date: dateStr,
      read: false
    };
    setNotifications(prev => [newNotif, ...(prev || [])]);
    showToast('Notificación enviada a todos los instructores');
    addHistoryEntry({
      action: 'Notificación masiva enviada',
      detail: `"${message}" — enviada a ${allInstructors.length} instructor${allInstructors.length !== 1 ? 'es' : ''}`,
      type: 'Notificaciones',
      kind: 'system',
    });
    setMessage('');
  };

  // Filtro combinado: nombre (texto libre) + área (select). Ambos deben
  // cumplirse a la vez; si el select de área está vacío ("Todas las áreas")
  // no restringe nada.
  const filtered = allInstructors.filter((i) => {
    const matchesName = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter === '' || i.area === areaFilter;
    return matchesName && matchesArea;
  });

  // Solo se promedian los instructores que ya tienen un cumplimiento real registrado.
  const withCompliance = allInstructors.filter(i => i.compliance !== null && i.compliance !== undefined);

  const stats = [
    { label: 'Total Instructores',   value: allInstructors.length, Icon: IconUsers, color: '#2E8B00', bg: theme === 'dark' ? 'rgba(22,163,74,0.15)' : '#F0FDF4' },
    { label: 'Activos',              value: allInstructors.filter(i => i.active !== false).length, Icon: IconCheckCircle, color: '#39A900', bg: theme === 'dark' ? 'rgba(34,197,94,0.15)' : '#F0FDF4' },
    { label: 'Inactivos',            value: allInstructors.filter(i => i.active === false).length, Icon: IconBan, color: '#ef4444', bg: theme === 'dark' ? 'rgba(239,68,68,0.15)' : '#FEF2F2' },
    { label: 'Cumplimiento Promedio',value: withCompliance.length ? Math.round(withCompliance.reduce((s, i) => s + i.compliance, 0) / withCompliance.length) + '%' : '—', Icon: IconTarget, color: '#F97316', bg: theme === 'dark' ? 'rgba(249,115,22,0.15)' : '#FFF7ED' },
    { label: 'Pendientes de rol',    value: pendingApproval.length, Icon: IconClock, color: '#EA580C', bg: theme === 'dark' ? 'rgba(234,88,12,0.15)' : '#FFF7ED' },
  ];

  const noticeBg = theme === 'dark' ? 'rgba(234,88,12,0.12)' : '#FFF7ED';
  const noticeBorder = theme === 'dark' ? 'rgba(234,88,12,0.35)' : '#FED7AA';

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: colors.text }}>

      {/* Toast */}
      <Toast toast={toast} />

      {/* Modal Cambiar Rol */}
      {roleModal && (
        <Modal title={`Cambiar rol de ${roleModal.name}`} onClose={() => setRoleModal(null)}>
          <p style={{ fontSize: 13, color: colors.textSecondary, margin: '0 0 16px' }}>Rol actual: <strong>{roleModal.role}</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setSelectedRole(r)} style={{
                padding: '10px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: selectedRole === r ? '2px solid #39A900' : `1px solid ${colors.border}`,
                background: selectedRole === r ? (theme === 'dark' ? 'rgba(34,197,94,0.12)' : '#F0FDF4') : colors.inputBg,
                color: selectedRole === r ? '#256F00' : colors.textSecondary,
                fontSize: 14, fontWeight: selectedRole === r ? 700 : 400,
              }}>{r}</button>
            ))}
          </div>
          <IconButton
            full
            icon={<IconRefresh size={16} color="#fff" />}
            label="Confirmar Cambio"
            onClick={handleChangeRole}
            disabled={!selectedRole || selectedRole === roleModal.role}
            bg="linear-gradient(135deg, #39A900, #2E8B00)"
            color="#fff"
          />
        </Modal>
      )}

      {/* Modal Activar / Desactivar */}
      {statusModal && (
        <Modal title={statusModal.active !== false ? `Desactivar a ${statusModal.name}` : `Activar a ${statusModal.name}`} onClose={() => setStatusModal(null)}>
          {statusModal.active !== false ? (
            <div style={{ background: noticeBg, borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: theme === 'dark' ? '#fdba74' : '#7C2D12', lineHeight: 1.6 }}>
              ¿Deseas desactivar a <strong>{statusModal.name}</strong>? Ya no podrá iniciar sesión ni se le contará en el cumplimiento de la unidad. Úsalo si ya no está trabajando en el SENA. Puedes reactivarlo cuando quieras.
            </div>
          ) : (
            <div style={{ background: theme === 'dark' ? 'rgba(22,163,74,0.12)' : '#F0FDF4', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: theme === 'dark' ? '#86efac' : '#14532d', lineHeight: 1.6 }}>
              ¿Deseas volver a activar a <strong>{statusModal.name}</strong>? Podrá iniciar sesión y aparecerá de nuevo como activo en el sistema.
            </div>
          )}
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setStatusModal(null)} style={{
              padding: '11px', borderRadius: 10, border: `1px solid ${colors.border}`,
              background: colors.inputBg, color: colors.textSecondary, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Cancelar</button>
            <IconButton
              icon={statusModal.active !== false ? <IconBan size={16} color="#fff" /> : <IconCheckCircle size={16} color="#fff" />}
              label={statusModal.active !== false ? 'Sí, Desactivar' : 'Sí, Activar'}
              onClick={handleToggleStatus}
              bg={statusModal.active !== false ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'linear-gradient(135deg, #39A900, #2E8B00)'}
              color="#fff"
            />
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {deleteModal && (
        <Modal title="Confirmar Eliminación" onClose={() => setDeleteModal(null)}>
          <div style={{ background: theme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FEF2F2', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: theme === 'dark' ? '#fca5a5' : '#7f1d1d', lineHeight: 1.6 }}>
            ¿Estás seguro que deseas eliminar a <strong>{deleteModal.name}</strong>?<br />
            Esta acción no se puede deshacer.
          </div>
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setDeleteModal(null)} style={{
              padding: '11px', borderRadius: 10, border: `1px solid ${colors.border}`,
              background: colors.inputBg, color: colors.textSecondary, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Cancelar</button>
            <IconButton
              icon={<IconTrash size={16} color="#fff" />}
              label="Sí, Eliminar"
              onClick={handleDelete}
              bg="linear-gradient(135deg, #ef4444, #dc2626)"
              color="#fff"
            />
          </div>
        </Modal>
      )}

      {/* Modal Asignar Rol (usuarios recién registrados) */}
      {assignModal && (
        <Modal title={`Asignar rol a ${assignModal.name}`} onClose={() => { setAssignModal(null); setAssignRole(''); }}>
          <p style={{ fontSize: 13, color: colors.textSecondary, margin: '0 0 16px' }}>
            Correo: <strong>{assignModal.email}</strong><br />
            Contrato: <strong>{assignModal.contractNumber}</strong> &nbsp;·&nbsp; SIIF: <strong>{assignModal.siif}</strong> &nbsp;·&nbsp; ARL: <strong>{assignModal.arl}</strong>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              { value: 'instructor', label: 'Instructor' },
              { value: 'coordinator', label: 'Coordinador' },
            ].map(r => (
              <button key={r.value} onClick={() => setAssignRole(r.value)} style={{
                padding: '10px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: assignRole === r.value ? '2px solid #F97316' : `1px solid ${colors.border}`,
                background: assignRole === r.value ? noticeBg : colors.inputBg,
                color: assignRole === r.value ? '#C2410C' : colors.textSecondary,
                fontSize: 14, fontWeight: assignRole === r.value ? 700 : 400,
              }}>{r.label}</button>
            ))}
          </div>
          <IconButton
            full
            icon={<IconCheckCircle size={16} color="#fff" />}
            label="Activar cuenta con este rol"
            onClick={handleAssignRoleToPending}
            disabled={!assignRole}
            bg="linear-gradient(135deg, #39A900, #2E8B00)"
            color="#fff"
          />
        </Modal>
      )}

      {/* Modal Rechazar registro */}
      {rejectModal && (
        <Modal title="Rechazar Registro" onClose={() => setRejectModal(null)}>
          <div style={{ background: theme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FEF2F2', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: theme === 'dark' ? '#fca5a5' : '#7f1d1d', lineHeight: 1.6 }}>
            ¿Deseas rechazar el registro de <strong>{rejectModal?.name}</strong>? No podrá iniciar sesión y su solicitud será eliminada.
          </div>
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setRejectModal(null)} style={{
              padding: '11px', borderRadius: 10, border: `1px solid ${colors.border}`,
              background: colors.inputBg, color: colors.textSecondary, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Cancelar</button>
            <IconButton
              icon={<IconTrash size={16} color="#fff" />}
              label="Sí, Rechazar"
              onClick={handleRejectPending}
              bg="linear-gradient(135deg, #ef4444, #dc2626)"
              color="#fff"
            />
          </div>
        </Modal>
      )}

      {/* Banner */}
      <div className="coord-banner" style={{
        background: 'linear-gradient(120deg, #2E8B00 0%, #1F6600 100%)',
        borderRadius: 18, padding: '26px 30px', marginBottom: 22, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(31,102,0,0.18)',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: 28, bottom: -8, opacity: 0.14, transform: 'scale(2.3) rotate(6deg)' }}>
          <SproutIcon size={38} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <IconBox bg="rgba(255,255,255,0.16)" size={26} radius={8}>
              <IconUsers size={14} color="#fff" />
            </IconBox>
            <span style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 500, letterSpacing: '0.3px' }}>Administración de Personal</span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 23, fontWeight: 700, letterSpacing: '-0.4px' }}>Gestión de Usuarios</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Administra instructores y envía notificaciones</p>
        </div>
      </div>

      {/* Notificación Masiva */}
      <div style={{ background: colors.card, borderRadius: 16, padding: '18px 22px', marginBottom: 22, border: `1px solid ${colors.border}`, borderLeft: '3px solid #EA580C', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <IconBox bg={theme === 'dark' ? 'rgba(234,88,12,0.15)' : '#FFF7ED'} size={26} radius={8}>
            <IconMail size={14} color="#EA580C" />
          </IconBox>
          <span style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>Enviar Notificación Masiva</span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe aquí el mensaje que deseas enviar a todos los instructores..."
          style={{
            width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10,
            border: `1px solid ${colors.border}`, background: colors.inputBg, fontSize: 13, color: colors.text,
            outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit',
          }}
        />
        <div style={{ marginTop: 12 }}>
          <IconButton
            icon={<IconMail size={15} color="#fff" />}
            label={`Enviar a Todos (${allInstructors.length} Instructores)`}
            onClick={handleMassNotify}
            bg="linear-gradient(135deg, #F97316, #C2410C)"
            color="#fff"
          />
        </div>
      </div>

      {/* Buscar y filtrar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: '#2E8B00' }} />
        <span style={{ fontWeight: 600, fontSize: 12.5, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Buscar y Filtrar</span>
      </div>
      <div style={{ background: colors.card, borderRadius: 14, padding: '14px 18px', marginBottom: 26, border: `1px solid ${colors.border}`, display: 'flex', gap: 12, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Buscar instructor por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px 10px 38px', width: '100%', boxSizing: 'border-box',
              borderRadius: 10, border: `1px solid ${colors.border}`, fontSize: 14,
              background: colors.inputBg, outline: 'none', color: colors.text,
            }}
          />
        </div>

        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          style={{
            padding: '10px 12px', borderRadius: 10, border: `1px solid ${colors.border}`,
            fontSize: 14, background: colors.inputBg, color: colors.text, minWidth: 220,
          }}
        >
          <option value="">Todas las áreas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Resumen general */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: '#2E8B00' }} />
        <span style={{ fontWeight: 600, fontSize: 12.5, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Resumen General</span>
      </div>

      {/* Stats */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 26 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: colors.card, borderRadius: 12, padding: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <IconBox bg={s.bg}>
              <s.Icon size={19} color={s.color} />
            </IconBox>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.5px', marginTop: 10 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Lista de instructores */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: '#2E8B00' }} />
        <span style={{ fontWeight: 600, fontSize: 12.5, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Lista de Instructores</span>
        <span style={{ fontSize: 12, color: colors.textFaint, fontWeight: 500 }}>({filtered.length})</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((inst) => {
          const hasCompliance = inst.compliance !== null && inst.compliance !== undefined;
          const compColor = !hasCompliance ? colors.textFaint : inst.compliance >= 90 ? '#2E8B00' : inst.compliance >= 80 ? '#F97316' : '#ef4444';
          return (
            <div key={inst.id} style={{
              background: colors.card, borderRadius: 14, padding: '16px 20px',
              border: `1px solid ${colors.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow .15s, opacity .15s', flexWrap: 'wrap',
              opacity: inst.active === false ? 0.6 : 1,
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: inst.bg, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: inst.color,
              }}>
                {inst.initials}
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>
                  {inst.name}
                  <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 6, background: theme === 'dark' ? 'rgba(22,163,74,0.15)' : '#F0FDF4', color: theme === 'dark' ? '#86efac' : '#256F00', fontWeight: 600 }}>{inst.role}</span>
                  {inst.active === false && (
                    <span style={{ marginLeft: 6, fontSize: 11, padding: '2px 8px', borderRadius: 6, background: theme === 'dark' ? 'rgba(239,68,68,0.15)' : '#FEF2F2', color: '#ef4444', fontWeight: 700 }}>Inactivo</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: colors.textFaint, marginTop: 2 }}>
                  {inst.email} &nbsp;·&nbsp; Área: {inst.area} &nbsp;·&nbsp; Último informe: {inst.lastReport}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: compColor }}>{hasCompliance ? `${inst.compliance}%` : '—'}</div>
                <div style={{ fontSize: 10, color: colors.textFaint }}>Cumplimiento</div>
                {hasCompliance && (
                  <ComplianceBar value={inst.compliance} color={compColor} trackColor={theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#EEF2ED'} />
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <ActionButton
                  label="Rol"
                  onClick={() => { setRoleModal(inst); setSelectedRole(inst.role); }}
                  bg={theme === 'dark' ? 'rgba(22,163,74,0.15)' : '#F0FDF4'}
                  color="#2E8B00"
                  hoverBg={theme === 'dark' ? 'rgba(22,163,74,0.25)' : '#DCFCE7'}
                />
                <ActionButton
                  label={inst.active === false ? 'Activar' : 'Desactivar'}
                  onClick={() => setStatusModal(inst)}
                  bg={inst.active === false ? (theme === 'dark' ? 'rgba(22,163,74,0.15)' : '#F0FDF4') : noticeBg}
                  color={inst.active === false ? '#2E8B00' : '#EA580C'}
                  hoverBg={inst.active === false ? (theme === 'dark' ? 'rgba(22,163,74,0.25)' : '#DCFCE7') : (theme === 'dark' ? 'rgba(234,88,12,0.25)' : '#FFEDD5')}
                />
                <ActionButton
                  label="Eliminar"
                  onClick={() => setDeleteModal(inst)}
                  bg={theme === 'dark' ? 'rgba(239,68,68,0.15)' : '#FEF2F2'}
                  color="#ef4444"
                  hoverBg={theme === 'dark' ? 'rgba(239,68,68,0.25)' : '#FEE2E2'}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Solicitudes de registro pendientes (debajo de Lista de Instructores) */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: '#EA580C' }} />
          <span style={{ fontWeight: 600, fontSize: 12.5, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Solicitudes de Registro Pendientes</span>
          {pendingApproval.length > 0 && (
            <span style={{ background: '#EA580C', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 9px' }}>
              {pendingApproval.length} pendiente{pendingApproval.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {pendingApproval.length === 0 ? (
          <div style={{ background: colors.card, borderRadius: 14, padding: '20px', border: `1px dashed ${colors.border}`, fontSize: 13, color: colors.textFaint, textAlign: 'center' }}>
            No hay solicitudes de registro pendientes en este momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingApproval.map((u) => (
              <div key={u.id} style={{
                background: colors.card, borderRadius: 14, padding: '16px 20px',
                border: `1px solid ${noticeBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: noticeBg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#EA580C',
                }}>
                  {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: colors.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.name}
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: '#EA580C', color: '#fff', fontWeight: 700 }}>Pendiente</span>
                  </div>
                  <div style={{ fontSize: 12, color: colors.textFaint, marginTop: 2 }}>
                    {u.email} &nbsp;·&nbsp; Contrato: {u.contractNumber} &nbsp;·&nbsp; SIIF: {u.siif} &nbsp;·&nbsp; ARL: {u.arl}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 2 }}>Registrado: {u.registeredAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setAssignModal(u); setAssignRole(''); }} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg, #39A900, #2E8B00)', color: '#fff',
                    fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  }}>Asignar rol</button>
                  <button onClick={() => setRejectModal(u)} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: theme === 'dark' ? 'rgba(239,68,68,0.15)' : '#FEF2F2', color: '#ef4444', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  }}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}