import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-muted/50">
      <Header onLogout={onLogout} />
      <main className="container mx-auto p-4 py-8">
        {children}
      </main>
    </div>
  );
}

