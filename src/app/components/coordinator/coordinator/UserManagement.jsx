import { useState } from 'react';
import Toast from '../Toast';

const initialInstructors = [
  { id: 1, name: 'María González',  email: 'maria.gonzalez@sena.edu.co',  compliance: 100, area: 'ADSO',       lastReport: '2024-11-05', initials: 'MG', color: '#6366f1', bg: '#EEF2FF', role: 'Instructor', active: true },
  { id: 2, name: 'Carlos Rodríguez',email: 'carlos.rodriguez@sena.edu.co', compliance: 95,  area: 'Redes',      lastReport: '2024-11-04', initials: 'CR', color: '#f97316', bg: '#FFF7ED', role: 'Instructor', active: true },
  { id: 3, name: 'Ana Martínez',    email: 'ana.martinez@sena.edu.co',     compliance: 100, area: 'Bienestar',  lastReport: '2024-11-03', initials: 'AM', color: '#22c55e', bg: '#F0FDF4', role: 'Instructor', active: true },
  { id: 4, name: 'Pedro Sánchez',   email: 'pedro.sanchez@sena.edu.co',    compliance: 72,  area: 'Sistemas',   lastReport: '2024-11-01', initials: 'PS', color: '#ef4444', bg: '#FEF2F2', role: 'Instructor', active: true },
  { id: 5, name: 'Laura Torres',    email: 'laura.torres@sena.edu.co',     compliance: 98,  area: 'Electrónica',lastReport: '2024-11-05', initials: 'LT', color: '#8b5cf6', bg: '#F5F3FF', role: 'Instructor', active: true },
];

const ROLES = ['Instructor', 'Coordinador'];

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24, backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 28, width: 'min(480px,100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#64748b' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const REGISTER_COLORS = ['#0ea5e9', '#f97316', '#a855f7', '#14b8a6', '#e11d48'];

export default function UserManagement({ pendingUsers = [], setPendingUsers, onAssignRole, onRejectUser }) {
  const [instructors, setInstructors] = useState(initialInstructors);
  const [searchTerm, setSearchTerm] = useState('');
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

  const showToast = (msg, color = '#16a34a') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const pendingApproval = pendingUsers.filter((u) => !u.role);

  // Usuarios auto-registrados que YA tienen rol de instructor: se muestran en la lista principal
  const activeRegisteredInstructors = pendingUsers
    .filter((u) => u.role === 'instructor')
    .map((u, idx) => ({
      id: `reg-${u.id}`,
      registeredId: u.id,
      isRegistered: true,
      name: u.name,
      email: u.email,
      compliance: 0,
      area: 'Sin asignar',
      lastReport: 'Sin informes aún',
      initials: u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: REGISTER_COLORS[idx % REGISTER_COLORS.length],
      bg: '#F7F9FC',
      role: 'Instructor',
      active: true,
    }));

  const allInstructors = [...instructors, ...activeRegisteredInstructors];

  const handleAssignRoleToPending = () => {
    if (!assignRole || !assignModal) return;
    onAssignRole?.(assignModal.id, assignRole);
    showToast(`✅ Rol de ${assignRole === 'instructor' ? 'Instructor' : 'Coordinador'} asignado a ${assignModal.name}. Ya puede iniciar sesión.`);
    setAssignModal(null);
    setAssignRole('');
  };

  const handleRejectPending = () => {
    if (!rejectModal) return;
    onRejectUser?.(rejectModal.id);
    showToast(`🗑 Registro de ${rejectModal.name} rechazado`, '#ef4444');
    setRejectModal(null);
  };

  const handleChangeRole = () => {
    if (roleModal.isRegistered) {
      showToast('El rol de usuarios auto-registrados se administra desde "Pendientes de aprobación".', '#f97316');
      setRoleModal(null);
      return;
    }
    setInstructors(prev => prev.map(i => i.id === roleModal.id ? { ...i, role: selectedRole } : i));
    showToast(`🔄 Rol de ${roleModal.name} cambiado a ${selectedRole}`);
    setRoleModal(null);
  };

  const handleToggleStatus = () => {
    const goingInactive = statusModal.active !== false;
    if (statusModal.isRegistered) {
      showToast('El estado de usuarios auto-registrados se administra desde "Pendientes de aprobación".', '#f97316');
      setStatusModal(null);
      return;
    }
    setInstructors(prev => prev.map(i => i.id === statusModal.id ? { ...i, active: !goingInactive } : i));
    showToast(
      goingInactive ? `🚫 ${statusModal.name} fue desactivado` : `✅ ${statusModal.name} fue activado de nuevo`,
      goingInactive ? '#ef4444' : '#16a34a'
    );
    setStatusModal(null);
  };

  const handleDelete = () => {
    if (deleteModal.isRegistered) {
      onRejectUser?.(deleteModal.registeredId);
    } else {
      setInstructors(prev => prev.filter(i => i.id !== deleteModal.id));
    }
    showToast(`🗑 ${deleteModal.name} eliminado del sistema`, '#ef4444');
    setDeleteModal(null);
  };

  const handleMassNotify = () => {
    if (!message.trim()) return;
    showToast(`✉️ Notificación enviada a ${allInstructors.length} instructores`);
    setMessage('');
  };

  const filtered = allInstructors.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Instructores',   value: allInstructors.length, icon: '👥', color: '#6366f1', bg: '#EEF2FF' },
    { label: 'Activos',              value: allInstructors.filter(i => i.active !== false).length, icon: '✅', color: '#22c55e', bg: '#F0FDF4' },
    { label: 'Inactivos',            value: allInstructors.filter(i => i.active === false).length, icon: '🚫', color: '#ef4444', bg: '#FEF2F2' },
    { label: 'Cumplimiento Promedio',value: Math.round(allInstructors.reduce((s, i) => s + i.compliance, 0) / allInstructors.length) + '%', icon: '🎯', color: '#8b5cf6', bg: '#F5F3FF' },
    { label: 'Pendientes de rol',    value: pendingApproval.length, icon: '⏳', color: '#f97316', bg: '#FFF7ED' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#111827' }}>

      {/* Toast */}
      <Toast toast={toast} />

      {/* Modal Cambiar Rol */}
      {roleModal && (
        <Modal title={`Cambiar rol de ${roleModal.name}`} onClose={() => setRoleModal(null)}>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>Rol actual: <strong>{roleModal.role}</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setSelectedRole(r)} style={{
                padding: '10px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: selectedRole === r ? '2px solid #6366f1' : '1px solid #E8ECF0',
                background: selectedRole === r ? '#EEF2FF' : '#F7F9FC',
                color: selectedRole === r ? '#4f46e5' : '#374151',
                fontSize: 14, fontWeight: selectedRole === r ? 700 : 400,
              }}>{r}</button>
            ))}
          </div>
          <button onClick={handleChangeRole} disabled={!selectedRole || selectedRole === roleModal.role} style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: (!selectedRole || selectedRole === roleModal.role) ? 0.5 : 1,
          }}>Confirmar Cambio</button>
        </Modal>
      )}

      {/* Modal Activar / Desactivar */}
      {statusModal && (
        <Modal title={statusModal.active !== false ? `Desactivar a ${statusModal.name}` : `Activar a ${statusModal.name}`} onClose={() => setStatusModal(null)}>
          {statusModal.active !== false ? (
            <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
              ¿Deseas desactivar a <strong>{statusModal.name}</strong>? Ya no podrá iniciar sesión ni se le contará en el cumplimiento de la unidad. Úsalo si ya no está trabajando en el SENA. Puedes reactivarlo cuando quieras.
            </div>
          ) : (
            <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#14532d', lineHeight: 1.6 }}>
              ¿Deseas volver a activar a <strong>{statusModal.name}</strong>? Podrá iniciar sesión y aparecerá de nuevo como activo en el sistema.
            </div>
          )}
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setStatusModal(null)} style={{
              padding: '11px', borderRadius: 10, border: '1px solid #E8ECF0',
              background: '#F7F9FC', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Cancelar</button>
            <button onClick={handleToggleStatus} style={{
              padding: '11px', borderRadius: 10, border: 'none',
              background: statusModal.active !== false ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>{statusModal.active !== false ? '🚫 Sí, Desactivar' : '✅ Sí, Activar'}</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {deleteModal && (
        <Modal title="Confirmar Eliminación" onClose={() => setDeleteModal(null)}>
          <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
            ¿Estás seguro que deseas eliminar a <strong>{deleteModal.name}</strong>?<br />
            Esta acción no se puede deshacer.
          </div>
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setDeleteModal(null)} style={{
              padding: '11px', borderRadius: 10, border: '1px solid #E8ECF0',
              background: '#F7F9FC', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Cancelar</button>
            <button onClick={handleDelete} style={{
              padding: '11px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>🗑 Sí, Eliminar</button>
          </div>
        </Modal>
      )}

      {/* Modal Asignar Rol (usuarios recién registrados) */}
      {assignModal && (
        <Modal title={`Asignar rol a ${assignModal.name}`} onClose={() => { setAssignModal(null); setAssignRole(''); }}>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
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
                border: assignRole === r.value ? '2px solid #16a34a' : '1px solid #E8ECF0',
                background: assignRole === r.value ? '#F0FDF4' : '#F7F9FC',
                color: assignRole === r.value ? '#15803d' : '#374151',
                fontSize: 14, fontWeight: assignRole === r.value ? 700 : 400,
              }}>{r.label}</button>
            ))}
          </div>
          <button onClick={handleAssignRoleToPending} disabled={!assignRole} style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: !assignRole ? 0.5 : 1,
          }}>✅ Activar cuenta con este rol</button>
        </Modal>
      )}

      {/* Modal Rechazar registro */}
      {rejectModal && (
        <Modal title="Rechazar Registro" onClose={() => setRejectModal(null)}>
          <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
            ¿Deseas rechazar el registro de <strong>{rejectModal?.name}</strong>? No podrá iniciar sesión y su solicitud será eliminada.
          </div>
          <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setRejectModal(null)} style={{
              padding: '11px', borderRadius: 10, border: '1px solid #E8ECF0',
              background: '#F7F9FC', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Cancelar</button>
            <button onClick={handleRejectPending} style={{
              padding: '11px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>🗑 Sí, Rechazar</button>
          </div>
        </Modal>
      )}

      {/* Banner */}
      <div className="coord-banner" style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👥</div>
            <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Administración de Personal</span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Gestión de Usuarios</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Administra instructores y envía notificaciones</p>
        </div>
        <button
          onClick={() => showToast('➕ Formulario de nuevo instructor próximamente')}
          style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7, backdropFilter: 'blur(4px)',
          }}>
          + Agregar Instructor
        </button>
      </div>

      {/* Notificación Masiva */}
      <div style={{ background: '#F0FDF4', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid #BBF7D0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✉️</div>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#15803d' }}>Enviar Notificación Masiva</span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe aquí el mensaje que deseas enviar a todos los instructores..."
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10,
            border: '1px solid #BBF7D0', background: '#fff', fontSize: 13, color: '#374151',
            outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit',
          }}
        />
        <button onClick={handleMassNotify} style={{
          marginTop: 10, padding: '9px 20px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
          fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
        }}>
          ✉️ Enviar a Todos ({allInstructors.length} Instructores)
        </button>
      </div>

      {/* Stats */}
      <div className="coord-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px', border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid #F0F2F5' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Buscar instructor por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 12px 10px 38px', width: '100%', boxSizing: 'border-box',
              borderRadius: 10, border: '1px solid #E8ECF0', fontSize: 14,
              background: '#F7F9FC', outline: 'none', color: '#374151',
            }}
          />
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 12 }}>Lista de Instructores</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((inst) => {
          const compColor = inst.compliance >= 90 ? '#16a34a' : inst.compliance >= 80 ? '#f97316' : '#ef4444';
          return (
            <div key={inst.id} style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                  {inst.name}
                  <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#EEF2FF', color: '#4f46e5', fontWeight: 600 }}>{inst.role}</span>
                  {inst.active === false && (
                    <span style={{ marginLeft: 6, fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#FEF2F2', color: '#ef4444', fontWeight: 700 }}>Inactivo</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                  {inst.email} &nbsp;·&nbsp; Área: {inst.area} &nbsp;·&nbsp; Último informe: {inst.lastReport}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: compColor }}>{inst.compliance}%</div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>Cumplimiento</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => { setRoleModal(inst); setSelectedRole(inst.role); }} style={{
                  padding: '5px 12px', borderRadius: 7, border: 'none',
                  background: '#EEF2FF', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>Rol</button>
                <button onClick={() => setStatusModal(inst)} style={{
                  padding: '5px 12px', borderRadius: 7, border: 'none',
                  background: inst.active === false ? '#F0FDF4' : '#FFF7ED',
                  color: inst.active === false ? '#16a34a' : '#f97316',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{inst.active === false ? 'Activar' : 'Desactivar'}</button>
                <button onClick={() => setDeleteModal(inst)} style={{
                  padding: '5px 12px', borderRadius: 7, border: 'none',
                  background: '#FEF2F2', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Solicitudes de registro pendientes (debajo de Lista de Instructores) */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Solicitudes de registro pendientes</span>
          {pendingApproval.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 9px' }}>
              {pendingApproval.length} pendiente{pendingApproval.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {pendingApproval.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px dashed #E8ECF0', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
            No hay solicitudes de registro pendientes en este momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingApproval.map((u) => (
              <div key={u.id} style={{
                background: '#fff', borderRadius: 14, padding: '16px 20px',
                border: '1px solid #FECACA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: '#FEF2F2', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#ef4444',
                }}>
                  {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.name}
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: '#ef4444', color: '#fff', fontWeight: 700 }}>Pendiente</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    {u.email} &nbsp;·&nbsp; Contrato: {u.contractNumber} &nbsp;·&nbsp; SIIF: {u.siif} &nbsp;·&nbsp; ARL: {u.arl}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Registrado: {u.registeredAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setAssignModal(u); setAssignRole(''); }} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                    fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  }}>Asignar rol</button>
                  <button onClick={() => setRejectModal(u)} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: '#FEF2F2', color: '#ef4444', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
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
