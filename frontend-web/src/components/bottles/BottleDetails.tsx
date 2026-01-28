import { Bottle } from '@/types';
import { useBottles } from '@/contexts/BottleContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Edit2, ArrowLeftRight, Package, MapPin, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { mockClients, mockWarehouses } from '@/data/mockData';

const typeLabels = {
  acier: 'Acier',
  composite: 'Composite',
  aluminium: 'Aluminium',
};

const locationLabels = {
  client: 'Client',
  warehouse: 'Entrepôt',
  cantinier: 'Cantinier',
};

interface BottleDetailsProps {
  bottle: Bottle;
  onClose: () => void;
  onEdit: () => void;
}

export function BottleDetails({ bottle, onClose, onEdit }: BottleDetailsProps) {
  const { getMovementsByBottle } = useBottles();
  const movements = getMovementsByBottle(bottle.id).slice(0, 5);

  const getLocationName = () => {
    if (bottle.currentLocation === 'client' && bottle.locationId) {
      return mockClients.find(c => c.id === bottle.locationId)?.name || 'Client inconnu';
    }
    if (bottle.currentLocation === 'warehouse' && bottle.locationId) {
      return mockWarehouses.find(w => w.id === bottle.locationId)?.name || 'Entrepôt inconnu';
    }
    return 'Cantinier';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{bottle.serialNumber}</h2>
            <p className="text-muted-foreground">{bottle.gasBrand}</p>
          </div>
        </div>
        <StatusBadge status={bottle.status} size="lg" />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Tag className="h-4 w-4" />
            Type
          </div>
          <p className="font-medium">{typeLabels[bottle.bottleType]}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Package className="h-4 w-4" />
            Volume
          </div>
          <p className="font-medium">{bottle.volume} {bottle.volumeUnit}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <MapPin className="h-4 w-4" />
            Localisation
          </div>
          <p className="font-medium">{locationLabels[bottle.currentLocation]}</p>
          <p className="text-sm text-muted-foreground">{getLocationName()}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="h-4 w-4" />
            Ajoutée le
          </div>
          <p className="font-medium">{format(bottle.createdAt, 'dd MMM yyyy', { locale: fr })}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Détails supplémentaires
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Poids:</span>
            <span className="font-medium">{bottle.weight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marque bouteille:</span>
            <span className="font-medium">{bottle.bottleBrand || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Code QR:</span>
            <span className="font-medium">{bottle.qrCode || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mise à jour:</span>
            <span className="font-medium">{format(bottle.updatedAt, 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Derniers Mouvements
        </h3>
        {movements.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            Aucun mouvement enregistré
          </p>
        ) : (
          <div className="space-y-2">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border"
              >
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {movement.from} → {movement.to}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Par {movement.movedByName}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(movement.timestamp, 'dd/MM HH:mm', { locale: fr })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Modifier
        </Button>
        <Button className="btn-gradient-primary">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Déplacer
        </Button>
      </div>
    </div>
  );
}
