import { useState, useRef } from 'react';
import './LoginScreen.css';
import { loginUser, registerUser, forgotPassword, verifyResetCode, resetPassword, getAllUsers } from '../../services/authService';

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

/* Ojo abierto (mostrar contraseña) */
const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

/* Ojo cerrado (ocultar contraseña) */
const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-3.27 2.9A9.12 9.12 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.22-5.94"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <path d="M1 1l22 22"/>
  </svg>
);

// Toast fijo en la parte superior de la pantalla: siempre visible sin
// importar en qué punto del formulario esté desplazado (scroll) el usuario.
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const styles = {
    error:   { bg: '#FEF2F2', border: '#FECACA', color: '#dc2626' },
    success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#16a34a' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1d4ed8' },
  }[toast.type];
  return (
    <div
      role="status"
      style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, width: 'min(420px, 92vw)',
        background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color,
        borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 600,
        lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 10,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      }}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        style={{
          background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
          fontSize: 18, lineHeight: 1, padding: 0, marginTop: -1,
        }}
      >
        ×
      </button>
    </div>
  );
};

// Requisitos de seguridad de contraseña
const getPasswordChecks = (pwd) => ({
  minLength: pwd.length >= 8,
  hasUpper: /[A-Z]/.test(pwd),
  hasLower: /[a-z]/.test(pwd),
  hasNumber: /\d/.test(pwd),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/;]/.test(pwd),
});

const isPasswordValid = (pwd) => Object.values(getPasswordChecks(pwd)).every(Boolean);

const PASSWORD_REQUIREMENTS = [
  { key: 'minLength', label: 'Mínimo 8 caracteres' },
  { key: 'hasUpper', label: 'Una letra mayúscula' },
  { key: 'hasLower', label: 'Una letra minúscula' },
  { key: 'hasNumber', label: 'Un número' },
  { key: 'hasSpecial', label: 'Un carácter especial (!@#$%...)' },
];

// Checklist visual reutilizable para requisitos de contraseña
const PasswordChecklist = ({ password }) => {
  if (!password) return null;
  const checks = getPasswordChecks(password);
  return (
    <div style={{
      marginTop: 8, padding: '10px 12px', background: '#F7F9FC',
      border: '1px solid #E8ECF0', borderRadius: 10,
    }}>
      {PASSWORD_REQUIREMENTS.map(({ key, label }) => {
        const ok = checks[key];
        return (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, lineHeight: 1.8,
            color: ok ? '#16a34a' : '#9CA3AF',
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: ok ? '#DCFCE7' : '#E5E7EB',
              color: ok ? '#16a34a' : '#9CA3AF',
              fontSize: 9,
            }}>
              {ok ? '✓' : '·'}
            </span>
            {label}
          </div>
        );
      })}
    </div>
  );
};

// Indicador visual de coincidencia entre contraseña y su repetición
const PasswordMatchIndicator = ({ password, confirmPassword }) => {
  if (!confirmPassword) return null;
  const matches = password.length > 0 && password === confirmPassword;
  return (
    <div className={`match-indicator ${matches ? 'match-ok' : 'match-bad'}`}>
      <span className="match-indicator-dot">{matches ? '✓' : '✕'}</span>
      {matches ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
    </div>
  );
};

// Validaciones de campos de registro
// Número de contrato: solo dígitos, entre 6 y 15 caracteres
const isValidContractNumber = (value) => /^\d{6,15}$/.test(String(value).trim());

// Compromiso SIIF: letras/números/guiones, entre 6 y 20 caracteres (ej: SIIF-2025-001)
const isValidSIIF = (value) => /^[A-Za-z0-9-]{6,20}$/.test(String(value).trim());

// Áreas / programas de formación del Centro Yamboró (Pitalito, Huila).
// Ajusta esta lista si tu centro maneja nombres distintos o más actualizados.
const AREAS_YAMBORO = [
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

// Administradoras de Riesgos Laborales (ARL) más comunes en Colombia.
// Ajusta esta lista si tu centro maneja otras aseguradoras.
const ARL_OPTIONS = [
  'ARL Sura',
  'Positiva Compañía de Seguros',
  'Seguros Bolívar',
  'Colmena Seguros',
  'Mapfre (antes Colpatria)',
  'La Equidad Seguros',
  'Compensar ARL',
];

// ===== Traducción de errores del servidor a mensajes claros en español =====
// El backend suele devolver textos técnicos de HTTP (ej: "Conflict", "Not Found",
// "Unauthorized") que no le dicen nada al usuario. Esta función los traduce a
// mensajes entendibles según la pantalla donde ocurrió el error.

const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.';
const PENDING_APPROVAL_MESSAGE = 'Tu solicitud de registro aún no ha sido aceptada por el coordinador.';

const DEFAULT_ERROR_MESSAGES = {
  login: 'No pudimos iniciar sesión. Verifica tu correo y contraseña.',
  register: 'No pudimos completar tu registro. Verifica tus datos e inténtalo de nuevo.',
  forgotPassword: 'No pudimos enviar el código de recuperación. Inténtalo de nuevo.',
  verifyCode: 'No pudimos verificar el código. Inténtalo de nuevo.',
  resetPassword: 'No pudimos restablecer tu contraseña. Inténtalo de nuevo.',
};

// Traducciones específicas por pantalla para los códigos/textos HTTP más comunes
const CONTEXT_STATUS_MESSAGES = {
  login: {
    conflict: 'Ya existe una sesión en conflicto con este usuario. Recarga la página e inténtalo de nuevo.',
    unauthorized: 'Correo o contraseña incorrectos.',
    forbidden: 'No tienes permisos para acceder con esta cuenta.',
    'not found': 'No encontramos una cuenta con ese correo electrónico.',
    'bad request': 'Revisa que el correo y la contraseña estén completos y sean válidos.',
    'too many requests': 'Demasiados intentos de inicio de sesión. Espera unos minutos e inténtalo de nuevo.',
    pending: PENDING_APPROVAL_MESSAGE,
  },
  register: {
    conflict: 'Ya existe una cuenta registrada con este correo, número de contrato o compromiso SIIF.',
    'bad request': 'Alguno de los datos del formulario no es válido. Revísalo e inténtalo de nuevo.',
    'too many requests': 'Demasiados intentos de registro. Espera unos minutos e inténtalo de nuevo.',
  },
  forgotPassword: {
    'not found': 'No encontramos una cuenta asociada a ese correo electrónico.',
    'bad request': 'El correo electrónico ingresado no es válido.',
    'too many requests': 'Ya se envió un código recientemente. Espera unos minutos antes de solicitar otro.',
    conflict: 'Ya hay una solicitud de recuperación en curso para este correo.',
  },
  verifyCode: {
    'bad request': 'El código ingresado es incorrecto.',
    'not found': 'El código ingresado no es válido o ya expiró.',
    conflict: 'Este código ya fue utilizado. Solicita uno nuevo.',
    unauthorized: 'El código ingresado es incorrecto.',
    'too many requests': 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
  },
  resetPassword: {
    'bad request': 'La nueva contraseña no cumple con los requisitos o el código ya expiró.',
    'not found': 'El código de verificación no es válido o ya expiró.',
    conflict: 'Esta contraseña ya fue utilizada anteriormente. Elige una diferente.',
    unauthorized: 'El código de verificación no es válido o ya expiró.',
  },
};

// Textos técnicos de HTTP que el backend puede devolver "en crudo" (no traducidos)
const GENERIC_HTTP_PHRASES = [
  'conflict', 'unauthorized', 'forbidden', 'not found', 'bad request',
  'internal server error', 'too many requests', 'gateway timeout',
  'service unavailable', 'request timeout', 'pending',
];

const getFriendlyErrorMessage = (err, context) => {
  const raw = (err?.message || '').trim();
  const lower = raw.toLowerCase();

  // Sin conexión con el servidor / backend caído
  if (!raw || lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return NETWORK_ERROR_MESSAGE;
  }

  // Cuenta registrada pero aún pendiente de aprobación del coordinador
  if (
    context === 'login' &&
    (lower === 'pendiente' || lower.includes('pending') || lower.includes('no aprobad') || lower.includes('en revisión') || lower.includes('en revision'))
  ) {
    return PENDING_APPROVAL_MESSAGE;
  }

  // Texto técnico de HTTP sin traducir (ej: "Conflict", "Not Found") -> usar mensaje específico de la pantalla
  if (GENERIC_HTTP_PHRASES.includes(lower)) {
    const contextMessages = CONTEXT_STATUS_MESSAGES[context] || {};
    return contextMessages[lower] || DEFAULT_ERROR_MESSAGES[context] || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }

  // Si el backend ya envía un mensaje legible (en español o descriptivo), se usa tal cual
  return raw;
};

export default function LoginScreen({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Toast global: { type: 'error' | 'success' | 'info', message: string }
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (type, message, duration = 4500) => {
    clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    if (duration) {
      toastTimeoutRef.current = setTimeout(() => setToast(null), duration);
    }
  };

  const closeToast = () => {
    clearTimeout(toastTimeoutRef.current);
    setToast(null);
  };

  // Paso del formulario de registro: 'form' -> 'success'
  const [registerStep, setRegisterStep] = useState('form');

  // Flujo de recuperación: 'email' -> 'code' -> 'password' -> 'success'
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetCode, setResetCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);

  const resetForgotState = () => {
    setShowForgotPassword(false);
    setForgotStep('email');
    setResetEmail('');
    setResetCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowResetPassword(false);
    setShowConfirmResetPassword(false);
  };

  const [registerName, setRegisterName] = useState('');
  const [registerContractNumber, setRegisterContractNumber] = useState('');
  const [registerContractError, setRegisterContractError] = useState('');
  const [registerSIIF, setRegisterSIIF] = useState('');
  const [registerSIIFError, setRegisterSIIFError] = useState('');
  const [registerARL, setRegisterARL] = useState('');
  const [registerArea, setRegisterArea] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ACCOUNTS = {
    'instructor@gmail.com':  { role: 'instructor', password: 'instructor', name: 'Instructor' },
    'coordinador@gmail.com': { role: 'coordinator', password: 'coordinador', name: 'Coordinador' },
  };


  // Limpia el formulario de registro y vuelve a la pantalla de login
  const handleBackToLoginFromRegister = () => {
    setIsRegisterMode(false);
    setRegisterStep('form');
    setRegisterName('');
    setRegisterContractNumber('');
    setRegisterContractError('');
    setRegisterSIIF('');
    setRegisterSIIFError('');
    setRegisterARL('');
    setRegisterArea('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
  };

  const handleLogin = async (event) => {
  event.preventDefault();
  if (!email || !password) {
    showToast('error', 'Por favor completa todos los campos');
    return;
  }
  setIsLoading(true);
  try {
    const userProfile = await loginUser(email.trim(), password);
    onLogin(userProfile);
  } catch (err) {
    console.warn("Login falló, verificando si la cuenta está pendiente de aprobación...", err);

    // El backend no distingue "credenciales incorrectas" de "cuenta
    // pendiente": ambos casos devuelven el mismo mensaje. Como workaround,
    // consultamos la lista de usuarios para ver si el correo ingresado
    // pertenece a una cuenta que aún no fue aprobada por el coordinador.
    let cuentaPendiente = false;
    try {
      const users = await getAllUsers();
      const match = (users || []).find(
        u => (u.email || '').trim().toLowerCase() === email.trim().toLowerCase()
      );
      if (match && (match.estado || '').toString().trim().toLowerCase() === 'pendiente') {
        cuentaPendiente = true;
      }
    } catch (lookupErr) {
      // Si esta consulta falla (ej. requiere estar autenticado), simplemente
      // seguimos con el flujo normal de error y no bloqueamos el login.
      console.warn("No se pudo verificar el estado de la cuenta:", lookupErr);
    }

    if (cuentaPendiente) {
      showToast('error', PENDING_APPROVAL_MESSAGE, 6000);
      setIsLoading(false);
      return;
    }

    const account = ACCOUNTS[email.trim().toLowerCase()];
    if (account && password.trim() === account.password) {
      onLogin({ role: account.role, name: account.name, email: email.trim().toLowerCase() });
    } else {
      showToast('error', getFriendlyErrorMessage(err, 'login'));
    }
  } finally {
    setIsLoading(false);
  }
};

  // Paso 1: pide el correo y envía el código (/api/forgot-password)
  const handleSendResetCode = async (event) => {
    event.preventDefault();
    if (!resetEmail) {
      showToast('error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPassword(resetEmail.trim());
      showToast('success', res.message || 'Hemos enviado un código a tu correo');
      setForgotStep('code');
    } catch (err) {
      showToast('error', getFriendlyErrorMessage(err, 'forgotPassword'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Paso 2: valida el código de 6 dígitos (/api/verify-reset-code)
  const handleVerifyCode = async (event) => {
    event.preventDefault();
    const code = resetCode.join('');
    if (code.length < 6) {
      showToast('error', 'Ingresa el código completo de 6 dígitos');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await verifyResetCode(resetEmail.trim(), code);
      showToast('success', res.message || 'Código verificado correctamente.');
      setForgotStep('password');
    } catch (err) {
      showToast('error', getFriendlyErrorMessage(err, 'verifyCode'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Paso 3: envía la nueva contraseña (/api/reset-password)
  const handleResetPassword = async (event) => {
    event.preventDefault();
    const code = resetCode.join('');
    if (!newPassword || !confirmNewPassword) {
      showToast('error', 'Por favor completa todos los campos de contraseña.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Las contraseñas no coinciden. Verifica ambos campos.');
      return;
    }
    if (!isPasswordValid(newPassword)) {
      showToast('error', 'La nueva contraseña no cumple con los requisitos mínimos de seguridad');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await resetPassword(resetEmail.trim(), code, newPassword);
      showToast('success', res.message || 'Contraseña restablecida exitosamente.');
      setForgotStep('success');
    } catch (err) {
      showToast('error', getFriendlyErrorMessage(err, 'resetPassword'));
    } finally {
      setForgotLoading(false);
    }
  };

  const isCodeComplete = resetCode.every(d => d !== '');

  const handleCodeDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // solo un dígito por casilla
    const next = [...resetCode];
    next[index] = value;
    setResetCode(next);
    // salta automáticamente a la siguiente casilla
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleContractNumberChange = (e) => {
    const value = e.target.value;
    setRegisterContractNumber(value);
    if (value && !isValidContractNumber(value)) {
      setRegisterContractError('Debe tener entre 6 y 15 dígitos numéricos');
    } else {
      setRegisterContractError('');
    }
  };

  const handleSIIFChange = (e) => {
    const value = e.target.value;
    setRegisterSIIF(value);
    if (value && !isValidSIIF(value)) {
      setRegisterSIIFError('Formato inválido (ej: SIIF-2025-001)');
    } else {
      setRegisterSIIFError('');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!registerName || !registerContractNumber || !registerSIIF || !registerARL || !registerEmail || !registerPassword || !registerConfirmPassword) {
      showToast('error', 'Por favor completa todos los campos');
      return;
    }
    if (!isValidContractNumber(registerContractNumber)) {
      showToast('error', 'El número de contrato debe tener entre 6 y 15 dígitos numéricos');
      return;
    }
    if (!isValidSIIF(registerSIIF)) {
      showToast('error', 'El compromiso SIIF tiene un formato inválido (ej: SIIF-2025-001)');
      return;
    }
    if (!isPasswordValid(registerPassword)) {
      showToast('error', 'La contraseña no cumple con los requisitos mínimos de seguridad');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      showToast('error', 'Las contraseñas no coinciden. Verifica ambos campos.');
      return;
    }
    setIsLoading(true);
    try {
      await registerUser({
        name: registerName,
        contractNumber: registerContractNumber,
        siif: registerSIIF,
        arl: registerARL,
        area: registerArea,
        email: registerEmail,
        password: registerPassword
      });

      // En vez de redirigir sola después de unos segundos, mostramos una
      // pantalla de éxito fija que confirma que la solicitud quedó enviada
      // al coordinador, y el usuario decide cuándo volver al login.
      showToast('success', '¡Registro enviado correctamente!');
      setRegisterStep('success');
    } catch (err) {
      console.error(err);
      showToast('error', getFriendlyErrorMessage(err, 'register'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // translate="no" evita que el traductor automático de Chrome reescriba
    // los nodos del DOM que React controla. Cuando Chrome traduce la página,
    // modifica el DOM por fuera de React y provoca errores tipo
    // "Failed to execute 'removeChild'/'insertBefore' on 'Node'", que dejan
    // la pantalla en blanco o impiden que el formulario cambie a modo registro.
    <div className="login-shell" translate="no">
      <Toast toast={toast} onClose={closeToast} />

      <button className="help-button" type="button" onClick={() => setShowHelp(true)} aria-label="Ayuda">
        ?
      </button>

      <main className="login-card">
        <div className="login-card-inner">
          {/* Encabezado */}
          <header className="login-header">
            <div className="brand-row">
              <div className="brand-icon">SENA</div>
              <div className="brand-info">
                <span className="brand-name">SITMI</span>
                <span className="brand-sub">Sistema de Gestión</span>
              </div>
            </div>
            <div className="login-title-block">
              <h2>
                {!isRegisterMode
                  ? 'Bienvenido de nuevo'
                  : registerStep === 'success'
                    ? 'Solicitud enviada'
                    : 'Crear cuenta'}
              </h2>
              <p className="login-subtitle">
                {!isRegisterMode
                  ? 'Ingresa tus credenciales para continuar'
                  : registerStep === 'success'
                    ? 'Tu registro está en revisión por el coordinador'
                    : 'Completa tus datos para solicitar acceso al portal'}
              </p>
            </div>
          </header>

          {/* ===== FORMULARIO LOGIN ===== */}
          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="login-form">
              <label className="field">
                <span>Correo electrónico</span>
                <div className="input-icon-wrap">
                  <span className="input-icon"><IconMail /></span>
                  <input
                    type="email"
                    placeholder="instructor@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    name="login-email-field"
                  />
                </div>
              </label>

              <label className="field">
                <span>Contraseña</span>
                <div className="input-icon-wrap">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    name="login-password-field"
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </label>

              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  Recordarme
                </label>
                <button type="button" className="ghost-button" onClick={() => { resetForgotState(); setShowForgotPassword(true); }}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Verificando…' : <><span>Iniciar sesión</span><IconArrow /></>}
              </button>

              <div className="divider"><span>o</span></div>

              <div className="link-row">
                ¿No tienes una cuenta?{' '}
                <button type="button" className="link-button" onClick={() => setIsRegisterMode(true)}>
                  Regístrate aquí
                </button>
              </div>
            </form>

          ) : registerStep === 'success' ? (
            /* ===== ÉXITO DE REGISTRO ===== */
            <div style={{ padding: '12px 4px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0',
                color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <IconCheck />
              </div>
              <h3 style={{ margin: '0 0 8px' }}>¡Registro enviado!</h3>
              <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: 13.5, lineHeight: 1.6 }}>
                Tu solicitud de registro fue enviada al coordinador para su aprobación.
                Te notificaremos por correo cuando sea revisada.
              </p>
              <button className="primary-button full-width" type="button" onClick={handleBackToLoginFromRegister}>
                Volver a iniciar sesión
              </button>
            </div>
          ) : (
            /* ===== FORMULARIO REGISTRO ===== */
            <form onSubmit={handleRegister} className="login-form">
              <label className="field">
                <span>Nombre completo</span>
                <input
                  type="text"
                  placeholder="Juan Pérez González"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </label>

              <div className="grid-two">
                <label className="field">
                  <span>Número de contrato</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    value={registerContractNumber}
                    onChange={handleContractNumberChange}
                    style={registerContractError ? { borderColor: '#dc2626' } : undefined}
                  />
                  {registerContractError && (
                    <span style={{ color: '#dc2626', fontSize: 11.5, fontWeight: 600, marginTop: 4, display: 'block' }}>
                      {registerContractError}
                    </span>
                  )}
                </label>
                <label className="field">
                  <span>Compromiso SIIF</span>
                  <input
                    type="text"
                    placeholder="SIIF-2025-001"
                    value={registerSIIF}
                    onChange={handleSIIFChange}
                    style={registerSIIFError ? { borderColor: '#dc2626' } : undefined}
                  />
                  {registerSIIFError && (
                    <span style={{ color: '#dc2626', fontSize: 11.5, fontWeight: 600, marginTop: 4, display: 'block' }}>
                      {registerSIIFError}
                    </span>
                  )}
                </label>
              </div>

              <label className="field">
                <span>ARL</span>
                <select
                  value={registerARL}
                  onChange={(e) => setRegisterARL(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid #E8ECF0', fontSize: 13, color: registerARL ? '#111827' : '#9CA3AF',
                    background: '#F7F9FC', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  <option value="">Selecciona tu ARL</option>
                  {ARL_OPTIONS.map(arl => (
                    <option key={arl} value={arl}>{arl}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Área</span>
                <select
                  value={registerArea}
                  onChange={(e) => setRegisterArea(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid #E8ECF0', fontSize: 13, color: registerArea ? '#111827' : '#9CA3AF',
                    background: '#F7F9FC', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  <option value="">Selecciona un área</option>
                  {AREAS_YAMBORO.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Correo electrónico</span>
                <div className="input-icon-wrap">
                  <span className="input-icon"><IconMail /></span>
                  <input
                    type="email"
                    placeholder="instructor@sena.edu.co"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    autoComplete="off"
                    name="register-email-field"
                  />
                </div>
              </label>

              <label className="field">
                <span>Contraseña</span>
                <div className="input-icon-wrap">
                  <span className="input-icon"><IconLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    autoComplete="new-password"
                    name="register-password-field"
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                <PasswordChecklist password={registerPassword} />
              </label>

              <label className="field">
                <span>Repetir contraseña</span>
                <div className={`input-icon-wrap ${registerConfirmPassword ? (registerConfirmPassword === registerPassword ? 'input-match' : 'input-mismatch') : ''}`}>
                  <span className="input-icon"><IconLock /></span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    name="register-confirm-password-field"
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                <PasswordMatchIndicator password={registerPassword} confirmPassword={registerConfirmPassword} />
              </label>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Registrando…' : 'Crear cuenta'}
              </button>

              <div className="link-row">
                ¿Ya tienes una cuenta?{' '}
                <button type="button" className="link-button" onClick={() => setIsRegisterMode(false)}>
                  Inicia sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* ===== DIALOG: RECUPERAR CONTRASEÑA ===== */}
      {showForgotPassword && (
        <div className="dialog-backdrop" onClick={resetForgotState}>
          <div className="dialog-card" onClick={(e) => e.stopPropagation()}>

            {/* Paso 1: pedir correo */}
            {forgotStep === 'email' && (
              <>
                <div className="dialog-header">
                  <div>
                    <h3>Recuperar contraseña</h3>
                    <p>Ingresa tu correo y te enviaremos un código de verificación.</p>
                  </div>
                  <button className="dialog-close" type="button" onClick={resetForgotState}>×</button>
                </div>
                <form onSubmit={handleSendResetCode} className="dialog-form">
                  <label className="field">
                    <span>Correo electrónico</span>
                    <div className="input-icon-wrap">
                      <span className="input-icon"><IconMail /></span>
                      <input
                        type="email"
                        placeholder="instructor@gmail.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  </label>
                  <div className="dialog-actions">
                    <button type="button" className="secondary-button" onClick={resetForgotState}>
                      Cancelar
                    </button>
                    <button type="submit" className="primary-button" disabled={forgotLoading}>
                      {forgotLoading ? 'Enviando…' : 'Enviar código'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Paso 2: ingresar código de 6 dígitos */}
            {forgotStep === 'code' && (
              <>
                <div className="dialog-header">
                  <div>
                    <h3>Ingresa el código</h3>
                    <p>Enviamos un código de 6 dígitos a <strong>{resetEmail}</strong>. Revisa tu bandeja de entrada (y spam).</p>
                  </div>
                  <button className="dialog-close" type="button" onClick={resetForgotState}>×</button>
                </div>
                <form onSubmit={handleVerifyCode} className="dialog-form">
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0 16px' }}>
                    {resetCode.map((digit, i) => (
                      <input
                        key={i}
                        id={`code-digit-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeDigitChange(i, e.target.value)}
                        style={{
                          width: 42, height: 48, textAlign: 'center', fontSize: 20, fontWeight: 700,
                          borderRadius: 10, border: '1.5px solid #E8ECF0', outline: 'none',
                          color: '#111827', background: '#F7F9FC',
                        }}
                      />
                    ))}
                  </div>

                  <div className="dialog-actions">
                    <button type="button" className="secondary-button" onClick={() => setForgotStep('email')}>
                      Volver
                    </button>
                    <button type="submit" className="primary-button" disabled={forgotLoading || !isCodeComplete}>
                      {forgotLoading ? 'Verificando…' : 'Verificar código'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Paso 3: ingresar nueva contraseña + confirmación */}
            {forgotStep === 'password' && (
              <>
                <div className="dialog-header">
                  <div>
                    <h3>Nueva contraseña</h3>
                    <p>Crea una nueva contraseña segura para tu cuenta <strong>{resetEmail}</strong>.</p>
                  </div>
                  <button className="dialog-close" type="button" onClick={resetForgotState}>×</button>
                </div>
                <form onSubmit={handleResetPassword} className="dialog-form">
                  <label className="field">
                    <span>Nueva contraseña</span>
                    <div className="input-icon-wrap">
                      <span className="input-icon"><IconLock /></span>
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-toggle"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        aria-label={showResetPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showResetPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                    <PasswordChecklist password={newPassword} />
                  </label>

                  <label className="field" style={{ marginTop: 12 }}>
                    <span>Confirmar nueva contraseña</span>
                    <div className="input-icon-wrap">
                      <span className="input-icon"><IconLock /></span>
                      <input
                        type={showConfirmResetPassword ? 'text' : 'password'}
                        placeholder="Repite la contraseña"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-toggle"
                        onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                        aria-label={showConfirmResetPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmResetPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                    <PasswordMatchIndicator password={newPassword} confirmPassword={confirmNewPassword} />
                  </label>

                  <div className="dialog-actions">
                    <button type="button" className="secondary-button" onClick={() => setForgotStep('code')}>
                      Volver
                    </button>
                    <button type="submit" className="primary-button" disabled={forgotLoading}>
                      {forgotLoading ? 'Restableciendo…' : 'Restablecer contraseña'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Paso 4: éxito */}
            {forgotStep === 'success' && (
              <div style={{ padding: '12px 4px', textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0',
                  color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <IconCheck />
                </div>
                <h3 style={{ margin: '0 0 8px' }}>¡Contraseña actualizada!</h3>
                <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: 13.5, lineHeight: 1.6 }}>
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <button className="primary-button full-width" type="button" onClick={resetForgotState}>
                  Volver a iniciar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== DIALOG: AYUDA ===== */}
      {showHelp && (
        <div className="dialog-backdrop" onClick={() => setShowHelp(false)}>
          <div className="dialog-card large" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h3>Centro de ayuda</h3>
                <p>Guía rápida para el Portal Instructor.</p>
              </div>
              <button className="dialog-close" type="button" onClick={() => setShowHelp(false)}>×</button>
            </div>
            <div className="help-block">
              <section>
                <div className="help-badge">1</div>
                <h4>¿Cómo inicio sesión?</h4>
                <p>Usa tu correo institucional y la contraseña asignada.</p>
                <ul>
                  <li>Instructor: correo <strong>instructor@gmail.com</strong>, contraseña <strong>instructor</strong></li>
                  <li>Coordinador: correo <strong>coordinador@gmail.com</strong>, contraseña <strong>coordinador</strong></li>
                </ul>
              </section>
              <section>
                <div className="help-badge">2</div>
                <h4>¿Qué puedo hacer en el portal?</h4>
                <p><strong>Como instructor:</strong></p>
                <ul>
                  <li>Subir y organizar documentos por carpetas mensuales</li>
                  <li>Recibir notificaciones de coordinación</li>
                  <li>Usar asistente IA para combinar archivos</li>
                  <li>Hacer seguimiento de requisitos y fechas límite</li>
                </ul>
                <p style={{ marginTop: 8 }}><strong>Como coordinador:</strong></p>
                <ul>
                  <li>Revisar documentos de todos los instructores</li>
                  <li>Enviar notificaciones masivas</li>
                  <li>Gestionar plantillas y requisitos</li>
                  <li>Administrar usuarios y permisos</li>
                </ul>
              </section>
              <section>
                <div className="help-badge">?</div>
                <h4>Preguntas frecuentes</h4>
                <ul>
                  <li>¿Olvidaste tu contraseña? Usa el enlace de recuperación.</li>
                  <li>¿Necesitas registro? Elige "Regístrate aquí".</li>
                </ul>
              </section>
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="primary-button full-width" type="button" onClick={() => setShowHelp(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}