import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { CantinierDashboard } from '@/components/dashboard/CantinierDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { useNotifications } from '@/hooks/useNotifications';
import { useBottleAlerts } from '@/hooks/useBottleAlerts';

export default function DashboardPage() {
  const { user } = useAuth();

  // Active les notifications automatiques
  useNotifications();
  useBottleAlerts();

  if (!user) {
    return <div className="p-8">Chargement...</div>;
  }

  // Affiche le dashboard selon le rôle
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'cantinier') {
    return <CantinierDashboard />;
  } else {
    return <ClientDashboard />;
  }
}
