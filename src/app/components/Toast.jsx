export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000,
        background: '#fff',
        borderRadius: 12,
        padding: '14px 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        borderLeft: `4px solid ${toast.color || '#16a34a'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        fontWeight: 600,
        color: '#111827',
        animation: 'toast-in 0.25s ease-out',
        maxWidth: 360,
      }}
    >
      <span>{toast.msg}</span>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
