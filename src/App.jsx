import { useState, useEffect, useRef } from 'react';
import CoordinatorDashboard from './app/components/coordinator/CoordinatorDashboard';
import InstructorDashboard from './app/components/instructor/InstructorDashboard';
import LoginScreen from './app/components/LoginScreen';
import WhatsAppFloatingButton from './app/components/WhatsAppFloatingButton';
import { ThemeProvider } from './ThemeContext';
import './App.css';

// ── Sesión por pestaña + cierre automático por inactividad ──────────────
// Antes la sesión se guardaba en localStorage, que se comparte entre TODAS
// las pestañas y ventanas del mismo navegador: al abrir una pestaña nueva
// ya entraba directo con la cuenta de quien fuera que hubiera iniciado
// sesión antes, sin pedir contraseña. Ahora se usa sessionStorage, que es
// propio de cada pestaña — una pestaña/ventana nueva siempre pide login.
// Además, la sesión se cierra sola si no hay actividad del usuario
// (mouse, teclado, clics, scroll) durante INACTIVITY_TIMEOUT_MS.
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos sin actividad

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('sena_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const userRef = useRef(user);
  userRef.current = user;

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      sessionStorage.setItem('sena_user', JSON.stringify(userData));
      sessionStorage.setItem('sena_last_activity', String(Date.now()));
    } catch {
      // sessionStorage no disponible, la sesión no persistirá pero el login funciona igual
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('sena_user');
      sessionStorage.removeItem('sitmi_token');
      sessionStorage.removeItem('sena_last_activity');
    } catch {
      // ignorar si sessionStorage no está disponible
    }
  };

  // Registra actividad del usuario y revisa periódicamente si ya pasó
  // demasiado tiempo sin ella, para cerrar la sesión automáticamente.
  useEffect(() => {
    if (!user) return;

    const touchActivity = () => {
      try {
        sessionStorage.setItem('sena_last_activity', String(Date.now()));
      } catch {
        // ignorar
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, touchActivity, { passive: true }));
    touchActivity(); // marca actividad al iniciar sesión / recargar con sesión activa

    // Se revisa por intervalo (no solo por temporizador único) porque los
    // navegadores limitan los timers de pestañas en segundo plano; al
    // comparar contra una marca de tiempo real, el cierre por inactividad
    // sigue siendo correcto aunque la pestaña haya estado inactiva.
    const intervalId = setInterval(() => {
      try {
        const last = Number(sessionStorage.getItem('sena_last_activity')) || 0;
        if (Date.now() - last > INACTIVITY_TIMEOUT_MS) {
          handleLogout();
        }
      } catch {
        // ignorar
      }
    }, 30 * 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, touchActivity));
      clearInterval(intervalId);
    };
  }, [user]);

  return (
    <ThemeProvider>
      {user ? (
        <>
          {user.role === 'instructor' ? (
            <InstructorDashboard user={user} onLogout={handleLogout} />
          ) : (
            <CoordinatorDashboard
              user={user}
              onLogout={handleLogout}
              pendingUsers={pendingUsers}
              setPendingUsers={setPendingUsers}
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}
          <WhatsAppFloatingButton />
        </>
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}

export default App;