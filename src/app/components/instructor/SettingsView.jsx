import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { changePassword, updateProfile } from '../../../services/authService';


// Colores institucionales (mismos que el resto de la app)
const GREEN = '#39A900';
const GREEN_DARK = '#1F6B0A';
const ORANGE = '#FF7A00';
const ORANGE_DARK = '#C75E00';

// ── Íconos de línea, consistentes con el resto de la app ─────────────────
const Icon = {
  Settings: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
  Sun: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  Moon: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="currentColor" stroke="none">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Camera: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 12} height={p?.size || 12} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7.8 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3.8L14.5 4Z" /><circle cx="12" cy="13" r="3.5" />
    </svg>
  ),
  Bell: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  Lock: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  Help: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4" /><path d="M12 17h.01" />
    </svg>
  ),
  Globe: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  ),
  Keyboard: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Bolt: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 15} height={p?.size || 15} fill="currentColor" stroke="none">
      <path d="M13 2 3 14h6l-1 8 11-14h-7l1-6Z" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 17} height={p?.size || 17} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 17} height={p?.size || 17} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 11 7 11 7a13.2 13.2 0 0 1-1.7 2.4M6.6 6.6C3.8 8.4 2 11.5 2 12s4 7 11 7a9.1 9.1 0 0 0 3.4-.64" />
      <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" /><path d="M2 2l20 20" />
    </svg>
  ),
  AlertCircle: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 13} height={p?.size || 13} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 12} height={p?.size || 12} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
    </svg>
  ),
};

// Clave de localStorage para la foto de perfil y nombre del evento que
// avisa al resto de la app (p. ej. el menú lateral) cuando la foto cambia.
const AVATAR_EVENT = 'sena-avatar-changed';
const getAvatarKey = (email) => `sena_avatar_${email || 'default'}`;

export default function SettingsView({ userName }) {
  const { theme, toggleTheme, colors } = useTheme();
  const savedUser = JSON.parse(localStorage.getItem('sena_user') || '{}');
  const userEmail = savedUser.email || 'instructor@sena.edu.co';
  const avatarKey = getAvatarKey(userEmail);

  const [notifEmail, setNotifEmail]       = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifUpdates, setNotifUpdates]   = useState(false);
  const [toast, setToast] = useState(null);

  // ── Perfil (nombre, correo, teléfono) ───────────────────────────────
  // Antes el input de "Nombre completo" era decorativo (`defaultValue`
  // sin `onChange` ni botón de guardar): escribir ahí no hacía nada y se
  // perdía al recargar la página. Ahora sí es un formulario real que
  // guarda en la base de datos (no solo en localStorage), igual que el
  // panel del coordinador.
  const [profileForm, setProfileForm] = useState({
    nombre: savedUser.name || userName || '',
    email: savedUser.email || userEmail,
    telefono: savedUser.telefono || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    if (!profileForm.nombre.trim()) {
      showToast('El nombre completo es obligatorio', '#ef4444');
      return;
    }
    if (!savedUser.id) {
      showToast('No se pudo identificar tu cuenta; vuelve a iniciar sesión.', '#ef4444');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile(savedUser.id, {
        nombre: profileForm.nombre,
        telefono: profileForm.telefono,
      });
      showToast('Perfil actualizado exitosamente');
    } catch (err) {
      showToast(err.message || 'No se pudo guardar el perfil', '#ef4444');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Nuevas preferencias ──────────────────────────────────────────────
  const [density, setDensity]     = useState('comfortable'); // 'comfortable' | 'compact'
  // La foto de perfil se carga desde localStorage al montar, así que
  // persiste entre recargas y sesiones hasta que el usuario la borre.
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(avatarKey) || null);
  const fileInputRef = useRef(null);

  // Contraseñas
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [passErrors, setPassErrors] = useState({});
  const [passLoading, setPassLoading] = useState(false);

  // Reglas de la nueva contraseña, evaluadas en vivo mientras se escribe.
  const passRules = {
    length: newPass.length >= 8,
    upper: /[A-Z]/.test(newPass),
    lower: /[a-z]/.test(newPass),
    number: /[0-9]/.test(newPass),
  };
  const passRulesPassed = Object.values(passRules).filter(Boolean).length;
  const passStrength = newPass.length === 0 ? null : passRulesPassed <= 1 ? 'Débil' : passRulesPassed <= 3 ? 'Media' : 'Fuerte';
  const passStrengthColor = passStrength === 'Fuerte' ? GREEN : passStrength === 'Media' ? ORANGE : '#ef4444';

  const validatePasswordForm = () => {
    const errs = {};
    if (!currPass) errs.curr = 'Ingresa tu contraseña actual';
    if (!newPass) {
      errs.new = 'Ingresa una nueva contraseña';
    } else if (!passRules.length || !passRules.upper || !passRules.lower || !passRules.number) {
      errs.new = 'Debe tener 8+ caracteres, mayúscula, minúscula y número';
    } else if (currPass && newPass === currPass) {
      errs.new = 'La nueva contraseña debe ser distinta a la actual';
    }
    if (!confPass) errs.conf = 'Confirma la nueva contraseña';
    else if (newPass && confPass !== newPass) errs.conf = 'Las contraseñas no coinciden';
    setPassErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Idioma y región
  const [language, setLanguage] = useState(() => localStorage.getItem('sena_lang') || 'Español');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('sena_timezone') || 'Colombia (GMT-5)');

  const showToast = (msg, color = GREEN) => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  // Si la foto se cambia desde otra pestaña/componente (poco probable, pero
  // por si el menú lateral también permite subirla), esta vista se mantiene sincronizada.
  useEffect(() => {
    const onAvatarChanged = (e) => {
      if (e.detail?.email === userEmail) setAvatarUrl(e.detail.avatarUrl);
    };
    window.addEventListener(AVATAR_EVENT, onAvatarChanged);
    return () => window.removeEventListener(AVATAR_EVENT, onAvatarChanged);
  }, [userEmail]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarUrl(dataUrl);
      localStorage.setItem(avatarKey, dataUrl);
      // Avisa al resto de la app (p. ej. el menú lateral) que hay una foto nueva.
      window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: { email: userEmail, avatarUrl: dataUrl } }));
      showToast('Foto de perfil actualizada');
    };
    reader.readAsDataURL(file);
    // Permite volver a seleccionar el mismo archivo si se borra y se vuelve a subir.
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem(avatarKey);
    window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: { email: userEmail, avatarUrl: null } }));
    showToast('Foto de perfil eliminada', ORANGE);
  };

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? GREEN : colors.borderStrong, position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: value ? 20 : 2, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );

  // Control segmentado reutilizable (para tamaño de texto y densidad)
  const SegmentedControl = ({ options, value, onChange }) => (
    <div style={{ display: 'flex', gap: 6, background: colors.inputBg, padding: 4, borderRadius: 10, border: `1px solid ${colors.border}` }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12.5, fontWeight: 600, transition: 'all .15s',
            background: value === opt.value ? GREEN : 'transparent',
            color: value === opt.value ? '#fff' : colors.textSecondary,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${colors.borderStrong}`, fontSize: 13, color: colors.textSecondary, background: colors.inputBg, outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 5, display: 'block' };
  const cardPad = density === 'compact' ? '16px' : '24px';
  const card = { background: colors.card, borderRadius: 16, padding: cardPad, border: `1px solid ${colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'padding .2s' };
  const rowGap = density === 'compact' ? 10 : 14;

  const shortcuts = [
    { keys: ['Ctrl', 'K'], desc: 'Buscar en el portal' },
    { keys: ['Ctrl', 'N'], desc: 'Nuevo informe' },
    { keys: ['Ctrl', ','], desc: 'Abrir configuración' },
    { keys: ['Esc'], desc: 'Cerrar ventana o modal' },
  ];

  const Kbd = ({ children }) => (
    <kbd style={{
      background: colors.inputBg, border: `1px solid ${colors.borderStrong}`, borderBottom: `2px solid ${colors.borderStrong}`,
      borderRadius: 6, padding: '2px 7px', fontSize: 11.5, fontWeight: 700, color: colors.text, fontFamily: 'monospace',
    }}>{children}</kbd>
  );

  return (
    <div className="sv-root" style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.text }}>
      <style>{`
        .sv-root { width: 100%; box-sizing: border-box; }
        .sv-root *, .sv-root *::before, .sv-root *::after { box-sizing: border-box; }
        .sv-content-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .sv-appearance-preview { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .sv-avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .sv-notif-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sv-save-btn { display: inline-flex; align-items: center; gap: 8px; }
        .sv-shortcut-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }

        @media (max-width: 900px) {
          .sv-content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .sv-banner { padding: 20px 18px !important; border-radius: 16px !important; }
          .sv-banner-title { font-size: 21px !important; }
          .sv-card { padding: 16px !important; }
          .sv-appearance-preview { gap: 8px; }
          .sv-save-btn { width: 100%; justify-content: center; padding: 12px 16px !important; }
          .sv-avatar-row { gap: 12px; }
          .sv-toast { left: 12px !important; right: 12px !important; top: 12px !important; text-align: center; }
        }
      `}</style>

      {toast && <div className="sv-toast" style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{toast.msg}</div>}

      {/* Banner */}
      <div className="sv-banner" style={{
        background: theme === 'dark'
          ? `linear-gradient(155deg, #0F2A18 0%, #14351E 55%, #1B4A28 100%)`
          : `linear-gradient(155deg, ${GREEN_DARK} 0%, ${GREEN} 62%, #4CBB10 100%)`,
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        color: '#fff',
        position: 'relative', overflow: 'hidden',
        border: theme === 'dark' ? '1px solid #1F4A2E' : 'none',
        boxShadow: theme === 'dark' ? '0 12px 32px -8px rgba(0,0,0,0.5)' : '0 12px 32px -8px rgba(31,107,10,0.45)',
      }}>
        {/* textura de puntos sutil */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)',
          backgroundSize: '15px 15px',
          maskImage: 'linear-gradient(115deg, rgba(0,0,0,0.9) 0%, transparent 55%)',
          WebkitMaskImage: 'linear-gradient(115deg, rgba(0,0,0,0.9) 0%, transparent 55%)',
        }} />
        {/* acento institucional inferior en naranja */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: `linear-gradient(90deg, ${ORANGE} 0%, rgba(255,122,0,0) 60%)` }} />

        <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 8px', fontSize: 12, opacity: 0.92, fontWeight: 700, letterSpacing: '0.06em', position: 'relative', textTransform: 'uppercase' }}><Icon.Settings size={13} /> Sistema</p>
        <h2 className="sv-banner-title" style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', position: 'relative' }}>Configuración</h2>
        <p style={{ margin: 0, fontSize: 13.5, opacity: 0.92, position: 'relative', maxWidth: 480, lineHeight: 1.5 }}>Administra tus preferencias y configuración de cuenta</p>
      </div>

      <div className="sv-content-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Apariencia */}
          <div className="sv-card" style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{theme === 'dark' ? <Icon.Moon /> : <Icon.Sun />}</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Apariencia</div>
            </div>

            {/* Vista previa en vivo del tema */}
            <div className="sv-appearance-preview">
              {[
                { key: 'light', label: 'Claro', bg: '#F7F9FC', card: '#fff', text: '#111827' },
                { key: 'dark',  label: 'Oscuro', bg: '#111827', card: '#1f2937', text: '#F3F4F6' },
              ].map(preview => {
                const selected = theme === preview.key;
                return (
                  <button
                    key={preview.key}
                    onClick={() => { if (!selected) toggleTheme(); }}
                    style={{
                      cursor: 'pointer', borderRadius: 12, padding: 10,
                      border: selected ? `2px solid ${GREEN}` : `1.5px solid ${colors.border}`,
                      background: preview.bg, textAlign: 'left',
                    }}
                  >
                    <div style={{ background: preview.card, borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                      <div style={{ width: '60%', height: 6, borderRadius: 3, background: preview.text, opacity: 0.85, marginBottom: 6 }} />
                      <div style={{ width: '40%', height: 6, borderRadius: 3, background: preview.text, opacity: 0.4 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: selected ? GREEN : preview.text }}>
                      {selected ? '✓ ' : ''}{preview.label}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Información Personal */}
          <div className="sv-card" style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.User /></div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Información Personal</div>
            </div>

            {/* Foto de perfil */}
            <div className="sv-avatar-row">
              <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto de perfil"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 700, fontSize: 22 }}>
                    {(userName || 'I').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%',
                    background: GREEN, border: `2px solid ${colors.card}`, color: '#fff', fontSize: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                  aria-label="Cambiar foto de perfil"
                >
                  <Icon.Camera />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Foto de perfil</div>
                <div style={{ fontSize: 12, color: colors.textFaint, marginTop: 2 }}>JPG o PNG, recomendado 400×400px</div>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    style={{
                      marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontSize: 12, fontWeight: 600, color: '#ef4444',
                    }}
                  >
                    <Icon.Trash /> Eliminar foto
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  style={inputStyle}
                  value={profileForm.nombre}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, nombre: e.target.value }))}
                />
              </div>
              <div><label style={labelStyle}>Correo electrónico</label><input style={{ ...inputStyle, cursor: 'not-allowed', opacity: 0.7 }} type="email" defaultValue={userEmail} readOnly /></div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  style={inputStyle}
                  type="tel"
                  value={profileForm.telefono}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, telefono: e.target.value }))}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                style={{
                  alignSelf: 'flex-start', marginTop: 4, padding: '9px 20px', borderRadius: 10,
                  border: 'none', background: savingProfile ? colors.borderStrong : GREEN,
                  color: '#fff', fontSize: 13.5, fontWeight: 700,
                  cursor: savingProfile ? 'not-allowed' : 'pointer',
                }}
              >
                {savingProfile ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="sv-card" style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bell /></div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Notificaciones</div>
            </div>
            {[
              { label: 'Notificaciones por email',   sub: 'Recibe alertas por correo electrónico', val: notifEmail,    set: setNotifEmail },
              { label: 'Recordatorios de informes',  sub: 'Alertas antes de la fecha límite',      val: notifReminder, set: setNotifReminder },
              { label: 'Actualizaciones del sistema',sub: 'Novedades y mejoras',                   val: notifUpdates,  set: setNotifUpdates },
            ].map((item, i) => (
              <div key={i} className="sv-notif-row" style={{ padding: `${rowGap}px 0`, borderBottom: i < 2 ? `1px solid ${colors.border}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: colors.textFaint, marginTop: 2 }}>{item.sub}</div>
                </div>
                <Toggle value={item.val} onChange={item.set} />
              </div>
            ))}
          </div>

          {/* Seguridad */}
          <div className="sv-card" style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Lock /></div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Seguridad</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap }}>
              {/* Contraseña actual */}
              <div>
                <label style={labelStyle}>Contraseña actual</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrPass ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: 40, border: `1.5px solid ${passErrors.curr ? '#ef4444' : colors.borderStrong}` }}
                    value={currPass}
                    onChange={e => { setCurrPass(e.target.value); if (passErrors.curr) setPassErrors(prev => ({ ...prev, curr: undefined })); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrPass(v => !v)}
                    aria-label={showCurrPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textFaint, display: 'flex', padding: 2 }}
                  >
                    {showCurrPass ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
                {passErrors.curr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11.5, color: '#ef4444' }}>
                    <Icon.AlertCircle /> {passErrors.curr}
                  </div>
                )}
              </div>

              {/* Nueva contraseña */}
              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: 40, border: `1.5px solid ${passErrors.new ? '#ef4444' : colors.borderStrong}` }}
                    value={newPass}
                    onChange={e => { setNewPass(e.target.value); if (passErrors.new) setPassErrors(prev => ({ ...prev, new: undefined })); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(v => !v)}
                    aria-label={showNewPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textFaint, display: 'flex', padding: 2 }}
                  >
                    {showNewPass ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>

                {/* Indicador de fortaleza, solo visible mientras se escribe */}
                {newPass.length > 0 && (
                  <div style={{ marginTop: 7 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < passRulesPassed ? passStrengthColor : colors.border, transition: 'background .2s' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: passStrengthColor }}>Fortaleza: {passStrength}</span>
                    </div>
                    <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 4, lineHeight: 1.5 }}>
                      {passRules.length ? '✓' : '·'} 8+ caracteres &nbsp;
                      {passRules.upper ? '✓' : '·'} Mayúscula &nbsp;
                      {passRules.lower ? '✓' : '·'} Minúscula &nbsp;
                      {passRules.number ? '✓' : '·'} Número
                    </div>
                  </div>
                )}
                {passErrors.new && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11.5, color: '#ef4444' }}>
                    <Icon.AlertCircle /> {passErrors.new}
                  </div>
                )}
              </div>

              {/* Confirmar nueva contraseña */}
              <div>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfPass ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: 40, border: `1.5px solid ${passErrors.conf ? '#ef4444' : (confPass && newPass && confPass === newPass ? GREEN : colors.borderStrong)}` }}
                    value={confPass}
                    onChange={e => { setConfPass(e.target.value); if (passErrors.conf) setPassErrors(prev => ({ ...prev, conf: undefined })); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfPass(v => !v)}
                    aria-label={showConfPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textFaint, display: 'flex', padding: 2 }}
                  >
                    {showConfPass ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
                {passErrors.conf ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11.5, color: '#ef4444' }}>
                    <Icon.AlertCircle /> {passErrors.conf}
                  </div>
                ) : confPass && newPass && confPass === newPass ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11.5, color: GREEN }}>
                    <Icon.Check size={12} /> Las contraseñas coinciden
                  </div>
                ) : null}
              </div>

              <button
                disabled={passLoading}
                onClick={async () => {
                  if (!validatePasswordForm()) return;
                  setPassLoading(true);
                  try {
                    await changePassword(userEmail, currPass, newPass);
                    showToast('✓ Contraseña cambiada con éxito');
                    setCurrPass('');
                    setNewPass('');
                    setConfPass('');
                    setPassErrors({});
                  } catch (err) {
                    showToast(err.message || 'Error al cambiar la contraseña', '#ef4444');
                  } finally {
                    setPassLoading(false);
                  }
                }}
                style={{
                  alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 10, border: '1.5px solid #ef4444',
                  background: '#FEF2F2', color: '#ef4444', fontSize: 13, fontWeight: 700,
                  cursor: passLoading ? 'not-allowed' : 'pointer', opacity: passLoading ? 0.6 : 1,
                }}
              >
                {passLoading ? 'Cambiando…' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}