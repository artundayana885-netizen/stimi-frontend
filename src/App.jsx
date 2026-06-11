import { useState } from 'react';
import CoordinatorDashboard from './app/components/coordinator/CoordinatorDashboard';
import InstructorDashboard from './app/components/instructor/InstructorDashboard';
import LoginScreen from './app/components/LoginScreen';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return user ? (
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
  );
}

export default App;
