import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, Truck, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

const API_URL = 'http://localhost:3001';

export default function CantinieursPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cantiniers, setCantiniers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Commence à true
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCantinier, setSelectedCantinier] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cantinierToDelete, setCantinierToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Cantinier123!',
    phone: '',
    employeeId: ''
  });

  // Charger les cantiniers
  const loadCantiniers = async () => {
    console.log('📥 Chargement des cantiniers...');
    try {
      const response = await fetch(`${API_URL}/api/users/cantiniers`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cantiniers chargés:', data.length);
        setCantiniers(data);
      } else {
        console.error('❌ Erreur response:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les cantiniers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCantiniers();
  }, []);

  const filteredCantiniers = cantiniers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('📤 Envoi:', formData);

      if (selectedCantinier) {
        // Mise à jour
        const response = await fetch(`${API_URL}/api/users/${selectedCantinier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            employeeId: formData.employeeId
          })
        });

        if (!response.ok) throw new Error('Update failed');

        toast({
          title: "✅ Cantinier mis à jour",
          description: `${formData.name} a été modifié avec succès`,
        });
      } else {
        // Création
        const response = await fetch(`${API_URL}/api/users/create-cantinier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Creation failed');
        }

        const result = await response.json();
        console.log('✅ Cantinier créé:', result);

        toast({
          title: "✅ Cantinier créé",
          description: `${formData.name} peut maintenant se connecter`,
        });
      }

      setFormOpen(false);
      setFormData({ name: '', email: '', password: 'Cantinier123!', phone: '', employeeId: '' });
      
      // IMPORTANT: Recharger la liste
      await loadCantiniers();

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!cantinierToDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${cantinierToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

      toast({
        title: "✅ Cantinier supprimé",
        description: `${cantinierToDelete.name} a été supprimé`,
      });

      await loadCantiniers();
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le cantinier",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCantinierToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des cantiniers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cantiniers</h1>
          <p className="text-muted-foreground">Gérez vos livreurs et leurs accès</p>
        </div>
        <Button onClick={() => {
          setSelectedCantinier(null);
          setFormData({ name: '', email: '', password: 'Cantinier123!', phone: '', employeeId: '' });
          setFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau cantinier
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cantiniers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cantiniers.length}</div>
            <p className="text-xs text-muted-foreground">Livreurs actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <div className="flex gap-4 p-4 bg-muted rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, email ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Grille de cantiniers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCantiniers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchTerm ? 'Aucun cantinier trouvé' : 'Aucun cantinier. Cliquez sur "Nouveau cantinier" pour en créer un.'}
          </div>
        ) : (
          filteredCantiniers.map((cantinier) => (
            <Card key={cantinier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  {cantinier.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">📧</span>
                    <span className="truncate">{cantinier.email}</span>
                  </div>
                  {cantinier.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📞</span>
                      <span>{cantinier.phone}</span>
                    </div>
                  )}
                  {cantinier.employeeId && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">🆔</span>
                      <span>Matricule: {cantinier.employeeId}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => navigate(`/cantiniers/${cantinier.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Profil
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCantinier(cantinier);
                      setFormData({
                        name: cantinier.name,
                        email: cantinier.email,
                        password: '',
                        phone: cantinier.phone || '',
                        employeeId: cantinier.employeeId || ''
                      });
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setCantinierToDelete(cantinier);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Affichage de {filteredCantiniers.length} sur {cantiniers.length} cantiniers
      </div>

      {/* Formulaire */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCantinier ? 'Modifier le cantinier' : 'Nouveau cantinier'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Mohamed Alami"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="employeeId">Matricule</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="Ex: CANT-001"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cantinier@eluxtan.ma"
                required
                disabled={!!selectedCantinier || submitting}
              />
              {selectedCantinier && (
                <p className="text-xs text-muted-foreground mt-1">
                  L'email ne peut pas être modifié
                </p>
              )}
            </div>

            {!selectedCantinier && (
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  required
                  disabled={submitting}
                />
              </div>
            )}

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0612345678"
                disabled={submitting}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'En cours...' : selectedCantinier ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le cantinier <strong>{cantinierToDelete?.name}</strong>?
              Cette action supprimera également son compte de connexion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
