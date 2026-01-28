import { useState } from 'react';
import { useBottles } from '@/contexts/BottleContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

export function NotificationCenter() {
  const { stats, bottles, movements } = useBottles();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Générer les notifications basées sur l'état actuel
  const generateNotifications = (): Notification[] => {
    const notifs: Notification[] = [];

    // Stock faible
    const stockPercentage = (stats.enStock / stats.totalBottles) * 100;
    if (stockPercentage < 30) {
      notifs.push({
        id: '1',
        type: 'warning',
        title: 'Stock Faible',
        message: `Seulement ${stats.enStock} bouteilles en stock (${Math.round(stockPercentage)}%)`,
        timestamp: new Date(),
      });
    }

    // Nombreuses bouteilles chez clients
    if (stats.chezClients > 20) {
      notifs.push({
        id: '2',
        type: 'info',
        title: 'Bouteilles chez Clients',
        message: `${stats.chezClients} bouteilles actuellement chez des clients`,
        timestamp: new Date(),
      });
    }

    // Mouvements récents
    if (movements.length > 0) {
      notifs.push({
        id: '3',
        type: 'success',
        title: 'Mouvements Récents',
        message: `${movements.length} mouvements enregistrés`,
        timestamp: new Date(),
      });
    }

    // Bouteilles en transit
    if (stats.enCirculation > 0) {
      notifs.push({
        id: '4',
        type: 'info',
        title: 'Bouteilles en Transit',
        message: `${stats.enCirculation} bouteilles actuellement en transit`,
        timestamp: new Date(),
      });
    }

    // Vérifier les anomalies
    const incomplete = bottles.filter(b => !b.serialNumber || !b.gasBrand);
    if (incomplete.length > 0) {
      notifs.push({
        id: '5',
        type: 'error',
        title: 'Données Incomplètes',
        message: `${incomplete.length} bouteilles avec des informations manquantes`,
        timestamp: new Date(),
      });
    }

    return notifs;
  };

  const activeNotifications = generateNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {activeNotifications.length > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {activeNotifications.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Alertes et informations importantes
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {activeNotifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune notification
            </div>
          ) : (
            activeNotifications.map((notif) => (
              <Card key={notif.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <CardTitle className="text-sm">{notif.title}</CardTitle>
                    </div>
                    <Badge variant={getVariant(notif.type) as any} className="text-xs">
                      {notif.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
