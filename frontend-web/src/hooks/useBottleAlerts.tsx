import { useEffect } from 'react';
import { useBottles } from '@/contexts/BottleContext';
import { useToast } from '@/hooks/use-toast';

export function useBottleAlerts() {
  const { bottles } = useBottles();
  const { toast } = useToast();

  useEffect(() => {
    // Simuler la détection de bouteilles qui sont chez les clients depuis longtemps
    // Dans un vrai système, on comparerait avec la date de dernier mouvement
    
    const bottlesWithClients = bottles.filter(b => b.currentLocation === 'client');
    
    // Alert si plus de 20 bouteilles chez clients
    if (bottlesWithClients.length > 20) {
      toast({
        title: "🔔 Suivi des Bouteilles",
        description: `${bottlesWithClients.length} bouteilles sont actuellement chez des clients`,
      });
    }

    // Alerte si des bouteilles spécifiques ont des anomalies
    const anomalies = bottles.filter(b => !b.serialNumber || !b.gasBrand);
    if (anomalies.length > 0) {
      toast({
        title: "⚠️ Anomalies Détectées",
        description: `${anomalies.length} bouteilles avec des informations incomplètes`,
        variant: "destructive",
      });
    }
  }, [bottles]);

  return null;
}
