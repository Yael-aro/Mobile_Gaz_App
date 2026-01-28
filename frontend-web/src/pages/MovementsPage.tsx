import { useBottles } from '@/contexts/BottleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Download } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { MovementForm } from '@/components/movements/MovementForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const API_URL = 'http://localhost:3001';

export default function MovementsPage() {
  const { movements, bottles, clients, loading } = useBottles();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterCantinier, setFilterCantinier] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [cantiniers, setCantiniers] = useState<any[]>([]);

  // Charger les cantiniers
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

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      // Filtre par localisation
      if (filterLocation !== 'all') {
        if (m.fromLocation !== filterLocation && m.toLocation !== filterLocation) {
          return false;
        }
      }

      // Filtre par cantinier
      if (filterCantinier !== 'all') {
        if (m.performedByUserId !== filterCantinier) {
          return false;
        }
      }

      // Filtre par client
      if (filterClient !== 'all') {
        if (m.toLocationId !== filterClient && m.fromLocationId !== filterClient) {
          return false;
        }
      }

      return true;
    });
  }, [movements, filterLocation, filterCantinier, filterClient]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: filteredMovements.length,
      deliveries: filteredMovements.filter(m => m.toLocation === 'client').length,
      pickups: filteredMovements.filter(m => m.fromLocation === 'client').length,
      toWarehouse: filteredMovements.filter(m => m.toLocation === 'entrepôt').length,
    };
  }, [filteredMovements]);

  // Fonction pour obtenir le nom du client
  const getClientName = (clientId: string | undefined) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  // Fonction pour obtenir le nom du cantinier
  const getCantinierName = (userId: string | undefined, fallbackName: string | undefined) => {
    if (!userId && !fallbackName) return 'Inconnu';
    if (fallbackName) return fallbackName;
    
    const cantinier = cantiniers.find(c => c.id === userId);
    return cantinier?.name || 'Utilisateur inconnu';
  };

  // Fonction pour obtenir les détails de la bouteille
  const getBottleInfo = (bottleId: string) => {
    if (!bottleId) return 'Bouteille inconnue';
    const bottle = bottles.find(b => b.id === bottleId);
    return bottle ? `${bottle.serialNumber} - ${bottle.gasBrand} ${bottle.gasVolume}L` : 'Bouteille inconnue';
  };

  // Fonction pour formater l'emplacement
  const formatLocation = (location: string | undefined, locationId?: string) => {
    if (!location) return 'Non défini';
    
    if (location === 'client' && locationId) {
      return getClientName(locationId) || location.charAt(0).toUpperCase() + location.slice(1);
    }
    
    return location.charAt(0).toUpperCase() + location.slice(1);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Heure', 'Bouteille', 'De', 'Vers', 'Effectué par', 'Client', 'Notes'];
    const rows = filteredMovements.map(m => [
      m.movementDate ? format(new Date(m.movementDate), 'dd/MM/yyyy') : '',
      m.movementDate ? format(new Date(m.movementDate), 'HH:mm') : '',
      getBottleInfo(m.bottleId),
      formatLocation(m.fromLocation, m.fromLocationId),
      formatLocation(m.toLocation, m.toLocationId),
      getCantinierName(m.performedByUserId, m.performedBy),
      m.toLocation === 'client' ? getClientName(m.toLocationId) || '' : '',
      m.notes || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mouvements-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des mouvements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mouvements</h1>
          <p className="text-muted-foreground">Historique complet des mouvements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
          {(user?.role === 'admin' || user?.role === 'cantinier') && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau mouvement
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Mouvements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveries}</div>
            <p className="text-xs text-muted-foreground">Vers clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Récupérations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pickups}</div>
            <p className="text-xs text-muted-foreground">Depuis clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.toWarehouse}</div>
            <p className="text-xs text-muted-foreground">Vers entrepôt</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes localisations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes localisations</SelectItem>
                <SelectItem value="entrepôt">Entrepôt</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="cantinier">Cantinier</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCantinier} onValueChange={setFilterCantinier}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les cantiniers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cantiniers</SelectItem>
                {cantiniers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.employeeId && `(${c.employeeId})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterLocation !== 'all' || filterCantinier !== 'all' || filterClient !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterLocation('all');
                  setFilterCantinier('all');
                  setFilterClient('all');
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des mouvements */}
      <div className="space-y-4">
        {filteredMovements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              Aucun mouvement trouvé
            </CardContent>
          </Card>
        ) : (
          filteredMovements.map((movement) => (
            <Card key={movement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Bouteille */}
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-lg">
                        {getBottleInfo(movement.bottleId)}
                      </div>
                    </div>

                    {/* Trajet */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">De</span>
                        <span className="px-3 py-1 bg-muted rounded-md capitalize">
                          {formatLocation(movement.fromLocation, movement.fromLocationId)}
                        </span>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground" />

                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">Vers</span>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-md capitalize font-medium">
                          {formatLocation(movement.toLocation, movement.toLocationId)}
                        </span>
                      </div>
                    </div>

                    {/* Infos supplémentaires */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {/* Effectué par */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Par:</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {getCantinierName(movement.performedByUserId, movement.performedBy)}
                        </span>
                      </div>

                      {/* Client concerné */}
                      {(movement.toLocation === 'client' || movement.fromLocation === 'client') && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Client:</span>
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                            {getClientName(movement.toLocationId || movement.fromLocationId) || 'Non spécifié'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {movement.notes && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Note:</span>{' '}
                        <span className="text-muted-foreground italic">{movement.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right text-sm">
                    {movement.movementDate && (
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(movement.movementDate), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(movement.movementDate), 'HH:mm', { locale: fr })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Affichage de {filteredMovements.length} sur {movements.length} mouvements
      </div>

      <MovementForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
