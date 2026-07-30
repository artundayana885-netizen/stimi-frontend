import { useState } from 'react';
import Toast from '../Toast';

// Documentos en la papelera. TODO: reemplazar con datos reales (API/backend)
// o dejar vacío si se llenará únicamente cuando el usuario elimine documentos.
// Estructura esperada por cada elemento:
// { id: number, name: string, deletedAt: 'YYYY-MM-DD', tag: string, tagColor: '#RRGGBB', tagBg: '#RRGGBB' }
const initialTrash = [];

export default function TrashView({ onRestore }) {
  const [items, setItems] = useState(initialTrash);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, color = '#16a34a') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRestore = (item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    onRestore?.(item);
    showToast(`↩ "${item.name}" restaurado correctamente`);
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmDelete(null);
    showToast('🗑 Eliminado permanentemente', '#ef4444');
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>

      {/* Toast */}
      <Toast toast={toast} />

      {/* Modal confirmar eliminación permanente */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, backdropFilter: 'blur(3px)' }}
          onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 20, width: 'min(400px,100%)', padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Eliminar Permanentemente</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 1.6 }}>
                ¿Seguro que deseas eliminar <strong>"{confirmDelete.name}"</strong>?<br/>Esta acción <strong>no se puede deshacer</strong>.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '11px', borderRadius: 10, border: '1px solid #E8ECF0', background: '#F7F9FC', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                × Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 60%, #f97316 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🗑</div>
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>Gestión de Archivos</span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Papelera</h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Documentos eliminados recientemente · Puedes restaurarlos o eliminarlos permanentemente</p>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: '48px 24px', textAlign: 'center', border: '1px solid #F0F2F5' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>La papelera está vacía</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>No hay documentos eliminados recientemente</div>
          </div>
        ) : items.map((item) => (
          <div key={item.id} style={{
            background: '#fff', borderRadius: 14, padding: '16px 20px',
            border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'box-shadow .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
          >
            {/* Ícono */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              📄
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                Eliminado el {item.deletedAt}
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: item.tagBg, color: item.tagColor }}>
                  {item.tag}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => handleRestore(item)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 9, border: '1.5px solid #16a34a',
                background: '#fff', color: '#16a34a', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                ↩ Restaurar
              </button>
              <button onClick={() => setConfirmDelete(item)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 9, border: '1.5px solid #FECACA',
                background: '#FEF2F2', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
              >
                × Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Aviso importante */}
      <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚠️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#c2410c', marginBottom: 4 }}>Aviso Importante</div>
          <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
            Los documentos en la papelera se eliminarán automáticamente después de 30 días. Si deseas conservarlos, restáuralos antes de que expire el plazo.
          </div>
        </div>
      </div>
    </div>
  );
}