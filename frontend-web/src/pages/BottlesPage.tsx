import { useBottles } from '@/contexts/BottleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, FileDown, FileSpreadsheet } from 'lucide-react';
import { useState, useMemo } from 'react';
import { BottleForm } from '@/components/bottles/BottleForm';
import { QRCodeGenerator } from '@/components/bottles/QRCodeGenerator';
import { QRCodeScanner } from '@/components/bottles/QRCodeScanner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { exportBottlesToPDF, exportBottlesToExcel } from '@/lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BottlesPage() {
  const { bottles, loading, deleteBottle } = useBottles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bottleToDelete, setBottleToDelete] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredBottles = useMemo(() => {
    return bottles.filter(bottle => {
      const matchesSearch = 
        bottle.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bottle.gasBrand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBrand = filterBrand === 'all' || bottle.gasBrand === filterBrand;
      const matchesLocation = filterLocation === 'all' || bottle.currentLocation === filterLocation;
      const matchesType = filterType === 'all' || bottle.bottleType === filterType;

      return matchesSearch && matchesBrand && matchesLocation && matchesType;
    });
  }, [bottles, searchTerm, filterBrand, filterLocation, filterType]);

  const handleEdit = (bottle: any) => {
    setSelectedBottle(bottle);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedBottle(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (bottle: any) => {
    setBottleToDelete(bottle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bottleToDelete) {
      try {
        await deleteBottle(bottleToDelete.id);
        toast({
          title: "✅ Bouteille supprimée",
          description: `${bottleToDelete.serialNumber} a été supprimée avec succès.`,
        });
      } catch (error) {
        toast({
          title: "❌ Erreur",
          description: "Impossible de supprimer la bouteille.",
          variant: "destructive",
        });
      }
      setDeleteDialogOpen(false);
      setBottleToDelete(null);
    }
  };

  const handleExportPDF = () => {
    exportBottlesToPDF(filteredBottles);
    toast({
      title: "✅ Export PDF réussi",
      description: `${filteredBottles.length} bouteilles exportées`,
    });
  };

  const handleExportExcel = () => {
    exportBottlesToExcel(filteredBottles);
    toast({
      title: "✅ Export Excel réussi",
      description: `${filteredBottles.length} bouteilles exportées`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des bouteilles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bouteilles de Gaz</h1>
        <div className="flex gap-2">
          {/* Scanner QR Code */}
          <QRCodeScanner />

          {/* Bouton Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exporter en Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton Ajouter - SEULEMENT POUR ADMIN */}
          {user?.role === 'admin' && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une bouteille
            </Button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par numéro ou marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les marques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les marques</SelectItem>
            <SelectItem value="Afriquia">Afriquia</SelectItem>
            <SelectItem value="Total">Total</SelectItem>
            <SelectItem value="Butagaz">Butagaz</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes localisations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes localisations</SelectItem>
            <SelectItem value="entrepôt">Entrepôt</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="cantinier">Cantinier</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="acier">Acier</SelectItem>
            <SelectItem value="composite">Composite</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || filterBrand !== 'all' || filterLocation !== 'all' || filterType !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterBrand('all');
              setFilterLocation('all');
              setFilterType('all');
            }}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">Numéro de série</th>
              <th className="p-4 text-left">Marque</th>
              <th className="p-4 text-left">Volume</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Poids</th>
              <th className="p-4 text-left">Localisation</th>
              <th className="p-4 text-left">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBottles.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  Aucune bouteille trouvée
                </td>
              </tr>
            ) : (
              filteredBottles.map((bottle) => (
                <tr key={bottle.id} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium">{bottle.serialNumber}</td>
                  <td className="p-4">{bottle.gasBrand}</td>
                  <td className="p-4">{bottle.gasVolume}L</td>
                  <td className="p-4 capitalize">{bottle.bottleType}</td>
                  <td className="p-4">{bottle.weight}kg</td>
                  <td className="p-4 capitalize">{bottle.currentLocation}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-sm bg-primary/10">
                      {bottle.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {/* QR Code - Visible pour tous */}
                      <QRCodeGenerator bottle={bottle} />
                      
                      {/* Modifier/Supprimer - SEULEMENT POUR ADMIN */}
                      {user?.role === 'admin' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(bottle)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(bottle)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Affichage de {filteredBottles.length} sur {bottles.length} bouteilles
        </span>
        {user?.role === 'cantinier' && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            👁️ Mode Lecture Seule
          </span>
        )}
      </div>

      {/* Formulaire - SEULEMENT POUR ADMIN */}
      {user?.role === 'admin' && (
        <BottleForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedBottle(null);
          }}
          bottle={selectedBottle}
        />
      )}

      {/* Dialog de suppression - SEULEMENT POUR ADMIN */}
      {user?.role === 'admin' && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la bouteille <strong>{bottleToDelete?.serialNumber}</strong>?
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
    </div>
  );
}
