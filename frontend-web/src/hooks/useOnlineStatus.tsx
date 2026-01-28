import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "✅ Connexion rétablie",
        description: "Vous êtes de nouveau en ligne",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📡 Mode Hors Ligne",
        description: "Vous êtes hors ligne. Certaines fonctionnalités sont limitées.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
}
