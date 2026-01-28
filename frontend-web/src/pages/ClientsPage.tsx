import { useBottles } from '@/contexts/BottleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ClientForm } from '@/components/clients/ClientForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ClientsPage() {
  const { clients, bottles, loading, deleteClient } = useBottles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [bottlesDialogOpen, setBottlesDialogOpen] = useState(false);
  const [clientBottles, setClientBottles] = useState<any[]>([]);
  const [selectedClientName, setSelectedClientName] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedClient(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (client: any) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete.id);
        toast({
          title: "✅ Client supprimé",
          description: `${clientToDelete.name} a été supprimé avec succès.`,
        });
      } catch (error) {
        toast({
          title: "❌ Erreur",
          description: "Impossible de supprimer le client.",
          variant: "destructive",
        });
      }
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleViewBottles = (client: any) => {
    // Filtrer les bouteilles de ce client
    const clientBottlesList = bottles.filter(
      b => b.currentLocation === 'client' && b.locationId === client.id
    );
    
    setClientBottles(clientBottlesList);
    setSelectedClientName(client.name);
    setBottlesDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        
        {/* Bouton Ajouter - SEULEMENT POUR ADMIN */}
        {user?.role === 'admin' && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un client
          </Button>
        )}
      </div>

      {/* Recherche */}
      <div className="flex gap-4 p-4 bg-muted rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, téléphone ou adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {user?.role === 'cantinier' && (
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded flex items-center">
            👁️ Mode Lecture Seule
          </span>
        )}
      </div>

      {/* Grille de clients */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Aucun client trouvé
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{client.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">📞</span>
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📍</span>
                      <span className="text-sm">{client.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {client.bottlesCount || 0} bouteilles
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  {/* Bouton Voir les bouteilles - Visible pour tous */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewBottles(client)}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Voir
                  </Button>

                  {/* Modifier/Supprimer - SEULEMENT POUR ADMIN */}
                  {user?.role === 'admin' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(client)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Affichage de {filteredClients.length} sur {clients.length} clients
      </div>

      {/* Formulaire client - SEULEMENT POUR ADMIN */}
      {user?.role === 'admin' && (
        <ClientForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
        />
      )}

      {/* Dialog de suppression - SEULEMENT POUR ADMIN */}
      {user?.role === 'admin' && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le client <strong>{clientToDelete?.name}</strong>?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog des bouteilles du client - Visible pour tous */}
      <Dialog open={bottlesDialogOpen} onOpenChange={setBottlesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bouteilles de {selectedClientName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {clientBottles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune bouteille active pour ce client
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {clientBottles.map((bottle) => (
                  <div
                    key={bottle.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{bottle.serialNumber}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Marque:</span>
                            <span className="ml-2 font-medium">{bottle.gasBrand}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="ml-2 font-medium">{bottle.gasVolume}L</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 font-medium capitalize">{bottle.bottleType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Poids:</span>
                            <span className="ml-2 font-medium">{bottle.weight}kg</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{clientBottles.length} bouteille(s)</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
