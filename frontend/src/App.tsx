import { useState } from 'react';
import { getAuthToken } from '@/api';
import LoginForm from '@/components/authentication/LoginForm';
import RegisterForm from '@/components/authentication/RegisterForm';
import MovieList from '@/components/movies/MovieList';
import Layout from '@/components/layout/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [showLogin, setShowLogin] = useState(true);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(true);
  };

  if (isAuthenticated) {
    return (
      <Layout onLogout={handleLogout}>
        <MovieList />
      </Layout>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">We Watch</h1>
          <p className="text-muted-foreground">Your shared movie watchlist app</p>
        </div>
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
    </div>
  );
}

export default App

