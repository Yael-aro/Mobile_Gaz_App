import { useBottles } from '@/contexts/BottleContext';
import { StatsCard } from '@/components/common/StatsCard';
import { Package, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CantinierDashboard() {
  const { stats, bottles, clients, movements, loading } = useBottles();

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  // Bouteilles en transit (chez le cantinier)
  const bottlesInTransit = bottles.filter(b => b.currentLocation === 'cantinier');

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Tableau de bord Cantinier</h1>
      
      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="En Transit"
          value={stats.enCirculation}
          icon={AlertCircle}
          trend="Chez vous"
        />
        <StatsCard
          title="Total Bouteilles"
          value={stats.totalBottles}
          icon={Package}
          trend="Dans le système"
        />
        <StatsCard
          title="En Stock"
          value={stats.enStock}
          icon={TrendingUp}
          trend="Entrepôt"
        />
        <StatsCard
          title="Chez Clients"
          value={stats.chezClients}
          icon={Users}
          trend="En livraison"
        />
      </div>

      {/* Mes bouteilles */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Bouteilles en Transit</CardTitle>
        </CardHeader>
        <CardContent>
          {bottlesInTransit.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune bouteille en transit
            </p>
          ) : (
            <div className="space-y-2">
              {bottlesInTransit.map(bottle => (
                <div key={bottle.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{bottle.serialNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {bottle.gasBrand} - {bottle.gasVolume}L
                    </p>
                  </div>
                  <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                    En transit
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mouvements récents */}
      <Card>
        <CardHeader>
          <CardTitle>Mouvements Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {movements.slice(0, 10).map(movement => (
              <div key={movement.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <div>
                  <p className="text-sm font-medium">
                    {movement.fromLocation} → {movement.toLocation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Par {movement.performedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
