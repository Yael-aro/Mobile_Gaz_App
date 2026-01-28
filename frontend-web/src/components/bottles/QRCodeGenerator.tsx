import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, QrCode, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';

interface QRCodeGeneratorProps {
  bottle: any;
}

export function QRCodeGenerator({ bottle }: QRCodeGeneratorProps) {
  const [open, setOpen] = useState(false);

  // Données à encoder dans le QR code
  const qrData = JSON.stringify({
    id: bottle.id,
    serialNumber: bottle.serialNumber,
    brand: bottle.gasBrand,
    volume: bottle.gasVolume,
    type: bottle.bottleType
  });

  const handleDownload = async () => {
    const qrElement = document.getElementById('qr-code-container');
    if (!qrElement) return;

    const canvas = await html2canvas(qrElement);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-${bottle.serialNumber}.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {bottle.serialNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            id="qr-code-container" 
            className="bg-white p-6 rounded-lg flex flex-col items-center gap-4"
          >
            <QRCode
              value={qrData}
              size={256}
              level="H"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
            
            <div className="text-center space-y-1">
              <p className="font-bold text-lg">{bottle.serialNumber}</p>
              <p className="text-sm text-gray-600">{bottle.gasBrand} - {bottle.gasVolume}L</p>
              <p className="text-xs text-gray-500 capitalize">{bottle.bottleType}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Scannez ce QR code pour accéder aux détails de la bouteille
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
