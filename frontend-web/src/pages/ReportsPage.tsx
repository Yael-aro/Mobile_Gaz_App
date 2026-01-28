import { useBottles } from '@/contexts/BottleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Truck, Users, Package, TrendingUp } from 'lucide-react';

const API_URL = 'http://localhost:3001';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const { movements, bottles, clients } = useBottles();
  const [cantiniers, setCantiniers] = useState<any[]>([]);

  useEffect(() => {
    const loadCantiniers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/cantiniers`);
        if (response.ok) {
          const data = await response.json();
          setCantiniers(data);
        }
      } catch (error) {
        console.error('Error loading cantiniers:', error);
      }
    };
    loadCantiniers();
  }, []);

  // Statistiques globales
  const globalStats = useMemo(() => ({
    totalBottles: bottles.length,
    inStock: bottles.filter(b => b.currentLocation === 'entrepôt').length,
    inCirculation: bottles.filter(b => b.currentLocation === 'client').length,
    inTransit: bottles.filter(b => b.currentLocation === 'cantinier').length,
    totalClients: clients.length,
    totalCantiniers: cantiniers.length,
    totalMovements: movements.length,
  }), [bottles, clients, cantiniers, movements]);

  // Mouvements par cantinier
  const movementsByCantinier = useMemo(() => {
    const stats = cantiniers.map(cantinier => {
      const cantinierMovements = movements.filter(
        m => m.performedByUserId === cantinier.id || m.performedBy === cantinier.name
      );
      return {
        name: cantinier.name,
        total: cantinierMovements.length,
        deliveries: cantinierMovements.filter(m => m.toLocation === 'client').length,
        pickups: cantinierMovements.filter(m => m.fromLocation === 'client').length,
      };
    });
    return stats.sort((a, b) => b.total - a.total);
  }, [cantiniers, movements]);

  // Mouvements par client
  const movementsByClient = useMemo(() => {
    const stats = clients.map(client => {
      const clientMovements = movements.filter(
        m => m.toLocationId === client.id || m.fromLocationId === client.id
      );
      return {
        name: client.name,
        deliveries: clientMovements.filter(m => m.toLocation === 'client' && m.toLocationId === client.id).length,
        pickups: clientMovements.filter(m => m.fromLocation === 'client' && m.fromLocationId === client.id).length,
        total: clientMovements.length,
        currentBottles: client.bottlesCount || 0,
      };
    });
    return stats.filter(s => s.total > 0).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [clients, movements]);

  // Répartition des bouteilles par marque
  const bottlesByBrand = useMemo(() => {
    const brands = bottles.reduce((acc, bottle) => {
      acc[bottle.gasBrand] = (acc[bottle.gasBrand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brands).map(([name, value]) => ({ name, value }));
  }, [bottles]);

  // Répartition par localisation
  const bottlesByLocation = useMemo(() => [
    { name: 'Entrepôt', value: globalStats.inStock, color: '#3b82f6' },
    { name: 'En circulation', value: globalStats.inCirculation, color: '#10b981' },
    { name: 'En transit', value: globalStats.inTransit, color: '#f59e0b' },
  ], [globalStats]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité Eluxtan</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bouteilles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalBottles}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Stock: {globalStats.inStock} | Circulation: {globalStats.inCirculation}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cantiniers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalCantiniers}</div>
            <p className="text-xs text-muted-foreground">Livreurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalMovements}</div>
            <p className="text-xs text-muted-foreground">Total des opérations</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Répartition des bouteilles */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des bouteilles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bottlesByLocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bottlesByLocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Par marque */}
        <Card>
          <CardHeader>
            <CardTitle>Bouteilles par marque</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bottlesByBrand}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" name="Bouteilles" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance des cantiniers */}
      <Card>
        <CardHeader>
          <CardTitle>Performance des cantiniers</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movementsByCantinier}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="deliveries" fill="#10b981" name="Livraisons" />
              <Bar dataKey="pickups" fill="#f59e0b" name="Récupérations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clients (par activité)</CardTitle>
        </CardHeader>
        <CardContent>
          {movementsByClient.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune activité client enregistrée
            </div>
          ) : (
            <div className="space-y-3">
              {movementsByClient.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.currentBottles} bouteille(s) actuellement
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{client.total} mouvements</div>
                    <div className="text-xs text-muted-foreground">
                      {client.deliveries} livr. | {client.pickups} récup.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
