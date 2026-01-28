import { useState, useEffect } from 'react';
import { useBottles } from '@/contexts/BottleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MovementFormProps {
  open: boolean;
  onClose: () => void;
}

type MovementMode = 'delivery' | 'return'; // Livraison ou Retour

export function MovementForm({ open, onClose }: MovementFormProps) {
  const { bottles, clients, addMovement } = useBottles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Mode mouvement : Livraison (entrepôt -> client) / Retour (client -> entrepôt)
  const [mode, setMode] = useState<MovementMode>('delivery');

  const [formData, setFormData] = useState({
    bottleId: '',
    fromLocation: '',
    fromLocationId: '', // ID du client source
    toLocation: '',
    toLocationId: '', // ID du client destination
    notes: '',
  });

  const isCantinier = user?.role === 'cantinier';

  // Helpers: appliquer les valeurs from/to selon le mode
  const applyModeToForm = (m: MovementMode) => {
    if (m === 'delivery') {
      setFormData(prev => ({
        ...prev,
        fromLocation: 'entrepôt',
        fromLocationId: '',
        toLocation: 'client',
        toLocationId: '',
        bottleId: '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        fromLocation: 'client',
        fromLocationId: '',
        toLocation: 'entrepôt',
        toLocationId: '',
        bottleId: '',
      }));
    }
  };

  // Quand le dialog s’ouvre : si cantinier => pré-remplir en "Livraison"
  useEffect(() => {
    if (!open) return;

    // Cantinier : démarrer en Livraison par défaut
    if (isCantinier) {
      setMode('delivery');
      setFormData(prev => ({
        ...prev,
        fromLocation: 'entrepôt',
        fromLocationId: '',
        toLocation: 'client',
        toLocationId: '',
        bottleId: '',
        // notes conservées si tu veux, sinon: notes: ''
      }));
      return;
    }

    // Admin/Autres : si tu veux, laisser vide ou garder dernier choix
    // Ici on ne force rien.
  }, [open, isCantinier]);

  // Filtrer les bouteilles selon la localisation FROM et le client FROM
  const availableBottles = bottles.filter(b => {
    if (!formData.fromLocation) return true;

    // Depuis un client spécifique
    if (formData.fromLocation === 'client' && formData.fromLocationId) {
      return b.currentLocation === 'client' && b.locationId === formData.fromLocationId;
    }

    // Sinon filtrer par localisation
    return b.currentLocation === formData.fromLocation;
  });

  // Reset fromLocationId when fromLocation changes
  useEffect(() => {
    if (formData.fromLocation !== 'client' && formData.fromLocationId) {
      setFormData(prev => ({ ...prev, fromLocationId: '' }));
    }
  }, [formData.fromLocation]);

  // Reset toLocationId when toLocation changes
  useEffect(() => {
    if (formData.toLocation !== 'client' && formData.toLocationId) {
      setFormData(prev => ({ ...prev, toLocationId: '' }));
    }
  }, [formData.toLocation]);

  // Reset bottleId when fromLocation or fromLocationId changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, bottleId: '' }));
  }, [formData.fromLocation, formData.fromLocationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation: bottle obligatoire
      if (!formData.bottleId) {
        toast({
          title: "❌ Erreur",
          description: "Veuillez sélectionner une bouteille",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validation client source si FROM client
      if (formData.fromLocation === 'client' && !formData.fromLocationId) {
        toast({
          title: "❌ Erreur",
          description: "Veuillez sélectionner le client source",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validation client destination si TO client
      if (formData.toLocation === 'client' && !formData.toLocationId) {
        toast({
          title: "❌ Erreur",
          description: "Veuillez sélectionner le client destination",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await addMovement({
        bottleId: formData.bottleId,
        fromLocation: formData.fromLocation,
        fromLocationId: formData.fromLocation === 'client' ? formData.fromLocationId : null,
        toLocation: formData.toLocation,
        toLocationId: formData.toLocation === 'client' ? formData.toLocationId : null,
        performedBy: user?.name || 'Unknown',
        performedByUserId: user?.uid || '',
        notes: formData.notes,
      });

      toast({
        title: "✅ Mouvement enregistré",
        description: "Le mouvement a été créé avec succès.",
      });

      // Reset form après succès
      if (isCantinier) {
        // Revenir au mode livraison par défaut
        setMode('delivery');
        setFormData({
          bottleId: '',
          fromLocation: 'entrepôt',
          fromLocationId: '',
          toLocation: 'client',
          toLocationId: '',
          notes: '',
        });
      } else {
        setMode('delivery');
        setFormData({
          bottleId: '',
          fromLocation: '',
          fromLocationId: '',
          toLocation: '',
          toLocationId: '',
          notes: '',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error creating movement:', error);
      toast({
        title: "❌ Erreur",
        description: "Une erreur s'est produite lors de la création du mouvement.",
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
          <DialogTitle>Nouveau mouvement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* MODE (Livraison / Retour) - seulement utile pour cantinier (mais ok pour tous) */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'delivery' ? 'default' : 'outline'}
              onClick={() => {
                setMode('delivery');
                applyModeToForm('delivery');
              }}
              disabled={loading}
              className="flex-1"
            >
              Livraison
            </Button>
            <Button
              type="button"
              variant={mode === 'return' ? 'default' : 'outline'}
              onClick={() => {
                setMode('return');
                applyModeToForm('return');
              }}
              disabled={loading}
              className="flex-1"
            >
              Retour
            </Button>
          </div>

          {/* DEPUIS */}
          <div>
            <Label htmlFor="fromLocation">Depuis *</Label>
            <Select
              value={formData.fromLocation}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  fromLocation: value,
                  fromLocationId: '',
                  bottleId: '',
                })
              }
              // pour cantinier on bloque (éviter erreurs)
              disabled={isCantinier || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrepôt">Entrepôt</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                {/* Tu peux enlever "cantinier" si tu ne veux pas l'utiliser comme localisation */}
                <SelectItem value="cantinier">Cantinier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CLIENT SOURCE (si depuis client) */}
          {formData.fromLocation === 'client' && (
            <div>
              <Label htmlFor="fromLocationId">Quel client ? *</Label>
              <Select
                value={formData.fromLocationId}
                onValueChange={(value) => setFormData({ ...formData, fromLocationId: value, bottleId: '' })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                      {client.bottlesCount > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({client.bottlesCount} bouteilles)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* BOUTEILLE */}
          <div>
            <Label htmlFor="bottleId">Bouteille *</Label>
            <Select
              value={formData.bottleId}
              onValueChange={(value) => setFormData({ ...formData, bottleId: value })}
              disabled={
                loading ||
                !formData.fromLocation ||
                (formData.fromLocation === 'client' && !formData.fromLocationId)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !formData.fromLocation
                      ? "Sélectionner d'abord la localisation"
                      : formData.fromLocation === 'client' && !formData.fromLocationId
                      ? "Sélectionner d'abord le client"
                      : "Sélectionner une bouteille"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableBottles.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">Aucune bouteille disponible</div>
                ) : (
                  availableBottles.map((bottle) => (
                    <SelectItem key={bottle.id} value={bottle.id}>
                      {bottle.serialNumber} - {bottle.gasBrand} {bottle.gasVolume}L
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {availableBottles.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {availableBottles.length} bouteille(s) disponible(s)
              </p>
            )}
          </div>

          {/* VERS */}
          <div>
            <Label htmlFor="toLocation">Vers *</Label>
            <Select
              value={formData.toLocation}
              onValueChange={(value) => setFormData({ ...formData, toLocation: value, toLocationId: '' })}
              disabled={isCantinier || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrepôt">Entrepôt</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                {/* Tu peux enlever "cantinier" si tu ne veux pas l'utiliser comme localisation */}
                <SelectItem value="cantinier">Cantinier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CLIENT DESTINATION (si vers client) */}
          {formData.toLocation === 'client' && (
            <div>
              <Label htmlFor="toLocationId">Quel client ? *</Label>
              <Select
                value={formData.toLocationId}
                onValueChange={(value) => setFormData({ ...formData, toLocationId: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* NOTES */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes additionnelles..."
              rows={3}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
