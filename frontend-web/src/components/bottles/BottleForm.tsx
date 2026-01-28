import { useState } from 'react';
import { useBottles } from '@/contexts/BottleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface BottleFormProps {
  open: boolean;
  onClose: () => void;
  bottle?: any;
}

export function BottleForm({ open, onClose, bottle }: BottleFormProps) {
  const { addBottle, updateBottle } = useBottles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    gasBrand: bottle?.gasBrand || '',
    serialNumber: bottle?.serialNumber || '',
    gasVolume: bottle?.gasVolume || '',
    bottleType: bottle?.bottleType || 'acier',
    weight: bottle?.weight || '',
    bottleBrand: bottle?.bottleBrand || '',
    currentLocation: bottle?.currentLocation || 'entrepôt',
    status: bottle?.status || 'en stock'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        gasVolume: parseFloat(formData.gasVolume.toString()),
        weight: parseFloat(formData.weight.toString())
      };

      if (bottle) {
        await updateBottle(bottle.id, submitData);
        toast({
          title: "✅ Bouteille mise à jour",
          description: "La bouteille a été modifiée avec succès.",
        });
      } else {
        await addBottle(submitData);
        toast({
          title: "✅ Bouteille ajoutée",
          description: "La nouvelle bouteille a été créée avec succès.",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Une erreur s'est produite lors de l'opération.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {bottle ? 'Modifier la bouteille' : 'Ajouter une bouteille'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gasBrand">Marque de gaz *</Label>
            <Select
              value={formData.gasBrand}
              onValueChange={(value) => setFormData({ ...formData, gasBrand: value, bottleBrand: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une marque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Afriquia">Afriquia</SelectItem>
                <SelectItem value="Total">Total</SelectItem>
                <SelectItem value="Butagaz">Butagaz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="serialNumber">Numéro de série *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Ex: AFR-2024-005"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gasVolume">Volume (L) *</Label>
              <Select
                value={formData.gasVolume.toString()}
                onValueChange={(value) => setFormData({ ...formData, gasVolume: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Volume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3L</SelectItem>
                  <SelectItem value="6">6L</SelectItem>
                  <SelectItem value="13">13L</SelectItem>
                  <SelectItem value="34">34L</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Poids (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="15.5"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bottleType">Type de bouteille *</Label>
            <Select
              value={formData.bottleType}
              onValueChange={(value) => setFormData({ ...formData, bottleType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acier">Acier</SelectItem>
                <SelectItem value="composite">Composite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currentLocation">Localisation *</Label>
            <Select
              value={formData.currentLocation}
              onValueChange={(value) => setFormData({ ...formData, currentLocation: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrepôt">Entrepôt</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="cantinier">Cantinier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'En cours...' : bottle ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
