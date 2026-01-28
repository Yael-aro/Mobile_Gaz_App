import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Truck, Package, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBottles } from '@/contexts/BottleContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const API_URL = 'http://localhost:3001';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CantinierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { movements, bottles, clients } = useBottles();
  const [cantinier, setCantinier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCantinier();
  }, [id]);

  const loadCantinier = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/cantinier/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCantinier(data);
      } else {
        toast({
          title: "❌ Erreur",
          description: "Cantinier introuvable",
          variant: "destructive",
        });
        navigate('/cantiniers');
      }
    } catch (error) {
      console.error('Error loading cantinier:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les détails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les mouvements de ce cantinier
  const cantinierMovements = movements.filter(
    m => m.performedByUserId === id || m.performedBy === cantinier?.name
  );

  // Statistiques
  const stats = {
    totalMovements: cantinierMovements.length,
    deliveries: cantinierMovements.filter(m => m.toLocation === 'client').length,
    pickups: cantinierMovements.filter(m => m.fromLocation === 'client').length,
    toWarehouse: cantinierMovements.filter(m => m.toLocation === 'entrepôt').length,
  };

  // Mouvements par jour (7 derniers jours)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: format(date, 'dd/MM'),
        count: 0
      });
    }
    return days;
  };

  const movementsByDay = getLast7Days();
  cantinierMovements.forEach(m => {
    if (m.movementDate) {
      const dateStr = format(new Date(m.movementDate), 'dd/MM');
      const dayData = movementsByDay.find(d => d.date === dateStr);
      if (dayData) dayData.count++;
    }
  });

  // Répartition des types de mouvements
  const movementTypes = [
    { name: 'Livraisons', value: stats.deliveries, color: '#10b981' },
    { name: 'Récupérations', value: stats.pickups, color: '#f59e0b' },
    { name: 'Retours entrepôt', value: stats.toWarehouse, color: '#3b82f6' },
  ].filter(t => t.value > 0);

  // Clients les plus livrés
  const clientDeliveries = cantinierMovements
    .filter(m => m.toLocation === 'client' && m.toLocationId)
    .reduce((acc, m) => {
      const clientId = m.toLocationId;
      acc[clientId] = (acc[clientId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topClients = Object.entries(clientDeliveries)
    .map(([clientId, count]) => ({
      clientId,
      name: clients.find(c => c.id === clientId)?.name || 'Client inconnu',
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!cantinier) {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/cantiniers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Truck className="h-8 w-8 text-primary" />
              {cantinier.name}
            </h1>
            <p className="text-muted-foreground">Profil et activités</p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Matricule</p>
              <p className="font-semibold">{cantinier.employeeId || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{cantinier.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-semibold">{cantinier.phone || 'Non défini'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mouvements</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMovements}</div>
            <p className="text-xs text-muted-foreground">Tous les mouvements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveries}</div>
            <p className="text-xs text-muted-foreground">Vers clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Récupérations</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pickups}</div>
            <p className="text-xs text-muted-foreground">Depuis clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retours</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.toWarehouse}</div>
            <p className="text-xs text-muted-foreground">Vers entrepôt</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activité sur 7 jours */}
        <Card>
          <CardHeader>
            <CardTitle>Activité (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={movementsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Mouvements" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des types */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des mouvements</CardTitle>
          </CardHeader>
          <CardContent>
            {movementTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={movementTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {movementTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Aucun mouvement enregistré
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top clients */}
      {topClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clients les plus livrés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div key={client.clientId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{client.count} livraisons</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des mouvements */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des mouvements récents</CardTitle>
        </CardHeader>
        <CardContent>
          {cantinierMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun mouvement enregistré
            </div>
          ) : (
            <div className="space-y-3">
              {cantinierMovements.slice(0, 10).map((movement) => {
                const bottle = bottles.find(b => b.id === movement.bottleId);
                const client = clients.find(c => c.id === movement.toLocationId);
                
                return (
                  <div key={movement.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {bottle?.serialNumber || 'Bouteille inconnue'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {bottle?.gasBrand} {bottle?.gasVolume}L
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-muted rounded capitalize">
                            {movement.fromLocation}
                          </span>
                          <span>→</span>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded capitalize">
                            {movement.toLocation === 'client' && client ? client.name : movement.toLocation}
                          </span>
                        </div>
                        {movement.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{movement.notes}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {movement.movementDate && format(new Date(movement.movementDate), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-xs">
                          {movement.movementDate && format(new Date(movement.movementDate), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
