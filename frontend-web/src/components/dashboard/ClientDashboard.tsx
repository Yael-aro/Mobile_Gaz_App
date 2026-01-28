import { useBottles } from '@/contexts/BottleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, History } from 'lucide-react';

export function ClientDashboard() {
  const { bottles, movements, loading } = useBottles();
  const { user } = useAuth();

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  // Dans un vrai système, on filtrerait par client ID
  // Pour l'instant, on affiche toutes les bouteilles chez des clients
  const myBottles = bottles.filter(b => b.currentLocation === 'client');

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Bienvenue, {user?.name}</h1>
        <p className="text-muted-foreground">Votre espace client</p>
      </div>

      {/* Mes bouteilles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Mes Bouteilles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myBottles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune bouteille active
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {myBottles.map(bottle => (
                <div key={bottle.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{bottle.gasBrand}</p>
                      <p className="text-sm text-muted-foreground">
                        {bottle.gasVolume}L - {bottle.bottleType}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Actif
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    N° {bottle.serialNumber}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique Récent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {movements.slice(0, 5).map(movement => (
              <div key={movement.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <div>
                  <p className="text-sm font-medium">
                    Mouvement de bouteille
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {movement.fromLocation} → {movement.toLocation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations de contact */}
      <Card>
        <CardHeader>
          <CardTitle>Besoin d'aide?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              Pour toute question ou demande de livraison, contactez-nous:
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>📞 Téléphone: 05XX-XXXXXX</p>
              <p>✉️ Email: contact@eluxtan.ma</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
