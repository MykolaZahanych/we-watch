import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/authentication/LoginForm';
import RegisterForm from '@/components/authentication/RegisterForm';

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/');
  };

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

