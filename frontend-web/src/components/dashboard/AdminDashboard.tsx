import { useBottles } from '@/contexts/BottleContext';
import { StatsCard } from '@/components/common/StatsCard';
import { Package, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export function AdminDashboard() {
  const { stats, bottles, clients, movements, loading } = useBottles();

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  // Données pour les graphiques
  const brandData = Object.entries(
    bottles.reduce((acc, bottle) => {
      acc[bottle.gasBrand] = (acc[bottle.gasBrand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const volumeData = Object.entries(
    bottles.reduce((acc, bottle) => {
      const vol = `${bottle.gasVolume}L`;
      acc[vol] = (acc[vol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([name, value]) => ({ name, value }));

  const typeData = Object.entries(
    bottles.reduce((acc, bottle) => {
      acc[bottle.bottleType] = (acc[bottle.bottleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const locationData = [
    { name: 'Entrepôt', value: stats.enStock },
    { name: 'Clients', value: stats.chezClients },
    { name: 'Transit', value: stats.enCirculation }
  ];

  // Données pour l'évolution (simulées basées sur les mouvements)
  const movementsByDate = movements.slice(0, 10).reverse().map((m, i) => ({
    date: `J-${10 - i}`,
    mouvements: i + 1
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Tableau de bord Administrateur</h1>
      
      {/* Statistiques en cartes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Bouteilles"
          value={stats.totalBottles}
          icon={Package}
          trend={`${stats.totalBottles} bouteilles`}
        />
        <StatsCard
          title="En Stock"
          value={stats.enStock}
          icon={TrendingUp}
          trend={`${Math.round((stats.enStock / stats.totalBottles) * 100)}%`}
        />
        <StatsCard
          title="Chez Clients"
          value={stats.chezClients}
          icon={Users}
          trend={`${clients.length} clients`}
        />
        <StatsCard
          title="En Transit"
          value={stats.enCirculation}
          icon={AlertCircle}
          trend="Cantinier"
        />
      </div>

      {/* Graphiques - Première ligne */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Répartition par localisation */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Localisation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par marque */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Marque</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0088FE" name="Bouteilles" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques - Deuxième ligne */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Répartition par volume */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#00C49F" name="Bouteilles" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Évolution des mouvements */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Mouvements (Derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={movementsByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mouvements" stroke="#8884d8" name="Mouvements" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Listes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bouteilles Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bottles.slice(0, 5).map(bottle => (
                <div key={bottle.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                  <div>
                    <p className="font-medium">{bottle.serialNumber}</p>
                    <p className="text-sm text-muted-foreground">{bottle.gasBrand} - {bottle.gasVolume}L</p>
                  </div>
                  <span className="text-sm px-2 py-1 rounded bg-primary/10 capitalize">
                    {bottle.currentLocation}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients Principaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clients.slice(0, 5).map(client => (
                <div key={client.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-primary/10">
                    {client.bottlesCount || 0} bouteilles
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
