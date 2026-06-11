import { useState } from 'react';
import './LoginScreen.css';

/* Íconos SVG inline livianos */
const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function LoginScreen({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerContractNumber, setRegisterContractNumber] = useState('');
  const [registerSIIF, setRegisterSIIF] = useState('');
  const [registerARL, setRegisterARL] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    if (!username || !password) {
      alert('Por favor completa todos los campos');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const role = password.trim().toLowerCase();
      if (role === 'instructor') {
        onLogin({ role: 'instructor', name: username, username });
      } else if (role === 'coordinador' || role === 'coordinator') {
        onLogin({ role: 'coordinator', name: username, username });
      } else {
        alert('Contraseña incorrecta. Usa "instructor" o "coordinador".');
      }
    }, 900);
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    if (!resetUsername) {
      alert('Por favor ingresa tu usuario');
      return;
    }
    setTimeout(() => {
      alert('Solicitud de recuperación enviada. Revisa tu bandeja de entrada si tu cuenta tiene un correo asociado.');
      setShowForgotPassword(false);
      setResetUsername('');
    }, 700);
  };

  const handleRegister = (event) => {
    event.preventDefault();
    if (!registerName || !registerContractNumber || !registerSIIF || !registerARL || !registerEmail || !registerPassword) {
      alert('Por favor completa todos los campos');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Registro exitoso. Ya puedes iniciar sesión.');
      setIsRegisterMode(false);
      setRegisterName('');
      setRegisterContractNumber('');
      setRegisterSIIF('');
      setRegisterARL('');
      setRegisterEmail('');
      setRegisterPassword('');
    }, 900);
  };

  return (
    <div className="login-shell">
      <button className="help-button" type="button" onClick={() => setShowHelp(true)} aria-label="Ayuda">
        ?
      </button>

      <main className="login-card">
        <div className="login-card-inner">
          {/* Encabezado con logo SENA */}
          <header className="login-header">
            <div className="brand-row">
              <div className="brand-icon">SENA</div>
              <div className="brand-info">
                <span className="brand-name">Portal Instructor</span>
                <span className="brand-sub">Sistema de Gestión</span>
              </div>
            </div>
            <div>
              <h2>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
              <p className="login-subtitle">
                {isRegisterMode
                  ? 'Completa el formulario para registrarte'
                  : 'Ingresa tus credenciales para acceder al portal'}
              </p>
            </div>
          </header>

          {/* ===== FORMULARIO LOGIN ===== */}
          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="login-form">
              <label className="field">
                <span>Usuario</span>
                <input
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Contraseña</span>
                <div className="password-row">
                  <div className="input-icon-wrap" style={{ flex: 1 }}>
                    <span className="input-icon"><IconLock /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: 60 }}
                    />
                  </div>
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </label>

              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  Recordarme
                </label>
                <button type="button" className="ghost-button" onClick={() => setShowForgotPassword(true)}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Cargando...' : <><span>Iniciar Sesión</span><IconArrow /></>}
              </button>


              <div className="link-row">
                ¿No tienes una cuenta?{' '}
                <button type="button" className="link-button" onClick={() => setIsRegisterMode(true)}>
                  Regístrate aquí
                </button>
              </div>
            </form>

          ) : (
            /* ===== FORMULARIO REGISTRO ===== */
            <form onSubmit={handleRegister} className="login-form">
              <label className="field">
                <span>Nombre Completo</span>
                <input
                  type="text"
                  placeholder="Juan Pérez González"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </label>

              <div className="grid-two">
                <label className="field">
                  <span>Número de Contrato</span>
                  <input
                    type="text"
                    placeholder="12345678"
                    value={registerContractNumber}
                    onChange={(e) => setRegisterContractNumber(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Compromiso SIIF</span>
                  <input
                    type="text"
                    placeholder="SIIF-2025-001"
                    value={registerSIIF}
                    onChange={(e) => setRegisterSIIF(e.target.value)}
                  />
                </label>
              </div>

              <label className="field">
                <span>ARL</span>
                <input
                  type="text"
                  placeholder="Positiva, Sura, Bolívar, etc."
                  value={registerARL}
                  onChange={(e) => setRegisterARL(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Correo Electrónico</span>
                <div className="input-icon-wrap">
                  <span className="input-icon"><IconMail /></span>
                  <input
                    type="email"
                    placeholder="instructor@sena.edu.co"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
              </label>

              <label className="field">
                <span>Contraseña</span>
                <div className="password-row">
                  <div className="input-icon-wrap" style={{ flex: 1 }}>
                    <span className="input-icon"><IconLock /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      style={{ paddingRight: 60 }}
                    />
                  </div>
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </label>

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
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
        <div className="dialog-backdrop" onClick={() => setShowForgotPassword(false)}>
          <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h3>Recuperar Contraseña</h3>
                <p>Ingresa tu usuario y te enviaremos un enlace de recuperación.</p>
              </div>
              <button className="dialog-close" type="button" onClick={() => setShowForgotPassword(false)}>×</button>
            </div>
            <form onSubmit={handleForgotPassword} className="dialog-form">
              <label className="field">
                <span>Usuario</span>
                <div className="input-icon-wrap">
                  <span className="input-icon"><IconMail /></span>
                  <input
                    type="text"
                    placeholder="usuario"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                  />
                </div>
              </label>
              <div className="dialog-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForgotPassword(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Enviar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DIALOG: AYUDA ===== */}
      {showHelp && (
        <div className="dialog-backdrop" onClick={() => setShowHelp(false)}>
          <div className="dialog-card large" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h3>Centro de Ayuda</h3>
                <p>Guía rápida para el Portal Instructor.</p>
              </div>
              <button className="dialog-close" type="button" onClick={() => setShowHelp(false)}>×</button>
            </div>
            <div className="help-block">
              <section>
                <div className="help-badge">1</div>
                <h4>¿Cómo inicio sesión?</h4>
                <p>Usa tu usuario y la contraseña asignada.</p>
                <ul>
                  <li>Instructor: contraseña <strong>instructor</strong></li>
                  <li>Coordinador: contraseña <strong>coordinador</strong></li>
                </ul>
              </section>
              <section>
                <div className="help-badge">2</div>
                <h4>¿Qué puedo hacer en el portal?</h4>
                <p><strong>Como Instructor:</strong></p>
                <ul>
                  <li>Subir y organizar documentos por carpetas mensuales</li>
                  <li>Recibir notificaciones de coordinación</li>
                  <li>Usar asistente IA para combinar archivos</li>
                  <li>Hacer seguimiento de requisitos y fechas límite</li>
                </ul>
                <p style={{ marginTop: 8 }}><strong>Como Coordinador:</strong></p>
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