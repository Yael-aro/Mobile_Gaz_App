import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBottles } from '@/contexts/BottleContext';

export function QRCodeScanner() {
  const [open, setOpen] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [manualInput, setManualInput] = useState('');
  const { bottles } = useBottles();
  const { toast } = useToast();

  const handleManualScan = () => {
    try {
      // Essayer de parser comme JSON d'abord
      let data;
      try {
        data = JSON.parse(manualInput);
      } catch {
        // Si ce n'est pas du JSON, chercher par numéro de série
        const bottle = bottles.find(b => 
          b.serialNumber.toLowerCase() === manualInput.toLowerCase()
        );
        if (bottle) {
          data = {
            id: bottle.id,
            serialNumber: bottle.serialNumber,
            brand: bottle.gasBrand,
            volume: bottle.gasVolume,
            type: bottle.bottleType
          };
        }
      }

      if (data) {
        setScannedData(data);
        toast({
          title: "✅ Bouteille trouvée",
          description: `${data.serialNumber} - ${data.brand}`,
        });
      } else {
        toast({
          title: "❌ Bouteille non trouvée",
          description: "Vérifiez le numéro de série",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Données invalides",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Scan className="h-4 w-4 mr-2" />
          Scanner QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner une Bouteille</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Note: Pour un vrai scanner, utiliser react-qr-reader */}
          <div className="space-y-2">
            <Label htmlFor="manual-input">Numéro de série ou données QR</Label>
            <div className="flex gap-2">
              <Input
                id="manual-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="AFR-2024-001"
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              />
              <Button onClick={handleManualScan}>
                <Scan className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Entrez le numéro de série ou collez les données du QR code
            </p>
          </div>

          {scannedData && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{scannedData.serialNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {scannedData.brand} - {scannedData.volume}L
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      Type: {scannedData.type}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Astuce:</strong> Dans une application mobile, vous pourriez utiliser 
              l'appareil photo pour scanner directement les QR codes.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
