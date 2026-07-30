import { useState } from 'react';
import CoordinatorDashboard from './app/components/coordinator/CoordinatorDashboard';
import InstructorDashboard from './app/components/instructor/InstructorDashboard';
import LoginScreen from './app/components/LoginScreen';
import { ThemeProvider } from './ThemeContext';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sena_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [pendingUsers, setPendingUsers] = useState([]);

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('sena_user', JSON.stringify(userData));
    } catch {
      // localStorage no disponible, la sesión no persistirá pero el login funciona igual
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('sena_user');
    } catch {
      // ignorar si localStorage no está disponible
    }
  };

  return (
    <ThemeProvider>
      {user ? (
        user.role === 'instructor' ? (
          <InstructorDashboard user={user} onLogout={handleLogout} />
        ) : (
          <CoordinatorDashboard
            user={user}
            onLogout={handleLogout}
            pendingUsers={pendingUsers}
            setPendingUsers={setPendingUsers}
          />
        )
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}

export default App;