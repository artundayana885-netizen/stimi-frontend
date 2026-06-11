import { useState } from 'react';

export default function TrashView() {
  const [items, setItems] = useState([
    { id: 1, name: 'Borrador Informe GC - Octubre', date: '2024-10-15', tag: 'Borrador', tagColor: '#ef4444', tagBg: '#FEF2F2' },
    { id: 2, name: 'Informe GF - Agosto',           date: '2024-08-20', tag: 'Informe',  tagColor: '#0ea5e9', tagBg: '#F0F9FF' },
  ]);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, color = '#16a34a') => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827' }}>
      {toast && <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}

      {/* Confirm Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 20, width: 'min(400px,100%)', padding: '32px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Eliminar Permanentemente</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>¿Seguro que deseas eliminar <strong>"{confirmDelete.name}"</strong>? Esta acción no se puede deshacer.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '12px', borderRadius: 10, border: '1px solid #E8ECF0', background: '#F7F9FC', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={() => { setItems(prev => prev.filter(i => i.id !== confirmDelete.id)); setConfirmDelete(null); showToast('🗑 Eliminado permanentemente', '#ef4444'); }} style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 60%, #f97316 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ margin: '0 0 6px', fontSize: 13, opacity: 0.9, fontWeight: 500 }}>🗑 Gestión de Archivos</p>
        <h2 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Papelera</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Documentos eliminados recientemente</p>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '48px 24px', textAlign: 'center', border: '1px solid #F0F2F5' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#6B7280' }}>La papelera está vacía</div>
          </div>
        ) : items.map(item => (
          <div key={item.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #F0F2F5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 8 }}>
                Eliminado el {item.date}
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
              </div>
            </div>
            <button onClick={() => { setItems(prev => prev.filter(i => i.id !== item.id)); showToast(`↩ "${item.name}" restaurado`); }} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #16a34a', background: '#fff', color: '#16a34a', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>↩ Restaurar</button>
            <button onClick={() => setConfirmDelete(item)} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>× Eliminar</button>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚠️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#c2410c', marginBottom: 4 }}>Aviso Importante</div>
          <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>Los documentos en la papelera se eliminarán automáticamente después de 30 días.</div>
        </div>
      </div>
    </div>
  );
}