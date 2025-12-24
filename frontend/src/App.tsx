import { useState } from 'react';
import { getAuthToken, removeAuthToken } from './api/client';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [showLogin, setShowLogin] = useState(true);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setShowLogin(true);
  };

  if (isAuthenticated) {
    return (
      <div className="app">
        <h1>We Watch</h1>
        <p>Your shared movie watchlist app</p>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>We Watch</h1>
      <p>Your shared movie watchlist app</p>
      {showLogin ? (
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setShowLogin(false)}
        />
      ) : (
        <RegisterForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setShowLogin(true)}
        />
      )}
    </div>
  );
}

export default App

