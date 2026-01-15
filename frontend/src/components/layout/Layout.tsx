import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '@/api';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <Header onLogout={handleLogout} />
      <main className="container mx-auto p-4 py-8">
        {children}
      </main>
    </div>
  );
}

