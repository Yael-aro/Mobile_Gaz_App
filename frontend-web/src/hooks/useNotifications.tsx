import { useEffect } from 'react';
import { useBottles } from '@/contexts/BottleContext';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { bottles, stats, movements } = useBottles();
  const { toast } = useToast();

  useEffect(() => {
    // Alerte stock faible (moins de 30% en stock)
    const stockPercentage = (stats.enStock / stats.totalBottles) * 100;
    if (stockPercentage < 30 && stockPercentage > 0) {
      toast({
        title: "⚠️ Stock Faible",
        description: `Seulement ${stats.enStock} bouteilles en stock (${Math.round(stockPercentage)}%)`,
        variant: "destructive",
      });
    }

    // Alerte si trop de bouteilles chez les clients (plus de 60%)
    const clientPercentage = (stats.chezClients / stats.totalBottles) * 100;
    if (clientPercentage > 60) {
      toast({
        title: "📦 Nombreuses Bouteilles chez Clients",
        description: `${stats.chezClients} bouteilles chez les clients (${Math.round(clientPercentage)}%)`,
      });
    }
  }, [stats.enStock, stats.chezClients, stats.totalBottles]);

  return null;
}
