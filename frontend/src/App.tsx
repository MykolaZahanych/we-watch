import { useState } from 'react';
import { getAuthToken, removeAuthToken } from '@/api/client';
import LoginForm from '@/components/authentication/LoginForm';
import RegisterForm from '@/components/authentication/RegisterForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>We Watch</CardTitle>
            <CardDescription>Your shared movie watchlist app</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Welcome! You're logged in.</p>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
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

