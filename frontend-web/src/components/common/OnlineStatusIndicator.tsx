import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          En ligne
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Hors ligne
        </>
      )}
    </Badge>
  );
}
