import { removeAuthToken } from '@/api';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const handleLogout = () => {
    removeAuthToken();
    onLogout();
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">WeWatch</h1>
            <span className="text-muted-foreground text-sm mt-[3px]">
              - your shared movie watchlist app
            </span>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

