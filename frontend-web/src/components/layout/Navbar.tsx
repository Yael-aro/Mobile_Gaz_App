import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { NotificationCenter } from '@/components/common/NotificationCenter';
import { OnlineStatusIndicator } from '@/components/common/OnlineStatusIndicator';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "✅ Déconnexion réussie",
        description: "À bientôt!",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary">Eluxtan</h1>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            {/* Indicateur en ligne/hors ligne */}
            <OnlineStatusIndicator />
            
            {/* Centre de Notifications */}
            <NotificationCenter />
            
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <div className="text-right">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
