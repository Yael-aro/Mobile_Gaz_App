import { Client } from '@/types';
import { useBottles } from '@/contexts/BottleContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Mail, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
}

export function ClientDetails({ client, onClose, onEdit }: ClientDetailsProps) {
  const { getBottlesByClient, movements } = useBottles();
  const clientBottles = getBottlesByClient(client.id);
  const clientMovements = movements
    .filter(m => m.clientId === client.id)
    .slice(0, 5);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xl">
          {getInitials(client.name)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{client.name}</h2>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{client.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{client.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Client depuis {format(client.createdAt, 'MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottles */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Package className="h-4 w-4" />
          Bouteilles Assignées ({clientBottles.length})
        </h3>
        {clientBottles.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4 bg-muted/50 rounded-lg">
            Aucune bouteille assignée à ce client
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clientBottles.map((bottle) => (
              <div
                key={bottle.id}
                className="p-3 rounded-lg border bg-card flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{bottle.serialNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {bottle.gasBrand} • {bottle.volume} {bottle.volumeUnit}
                  </p>
                </div>
                <StatusBadge status={bottle.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movement History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Historique des Mouvements
        </h3>
        {clientMovements.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4 bg-muted/50 rounded-lg">
            Aucun mouvement enregistré
          </p>
        ) : (
          <div className="space-y-2">
            {clientMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{movement.bottleSerial}</p>
                  <p className="text-xs text-muted-foreground">
                    {movement.from} → {movement.to}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(movement.timestamp, 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onEdit}>
            <Edit2 className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );
}
